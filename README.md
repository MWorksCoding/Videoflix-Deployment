# Videoflix — Dockerized Fullstack Deployment

Runs the whole stack with Docker Compose:

| Service    | What it is                                         | URL / Port (host)          |
|------------|----------------------------------------------------|----------------------------|
| `frontend` | nginx: Angular app + proxy to the API, static, media | http://localhost:8000    |
| `backend`  | Django REST API (gunicorn)                         | – (internal, via nginx)    |
| `worker`   | RQ worker running ffmpeg video conversion          | –                          |
| `db`       | PostgreSQL 16                                      | 127.0.0.1:5433 (inspect)   |
| `redis`    | Redis 7 (cache + task queue)                       | – (internal)               |

Everything is served from **one origin on port 8000**. nginx in the `frontend`
container serves the Angular build and forwards these paths to Django:
`/admin/`, `/api/`, `/django-rq/`, `/login/`, `/logout/`, `/videos/`,
`/register-verified/`, `/password-reset-verified/`. It serves `/static/`
(collectstatic output) and `/media/` (uploaded videos) straight from the
shared volumes, so this also works with `DEBUG=False`.

Port 8000 is bound to `127.0.0.1` only. On the server, a reverse proxy on the
host (nginx + certbot) terminates HTTPS and forwards to it.

## Run it locally

```bash
# from this directory (where docker-compose.yml lives)
docker compose up --build
```

First build takes a few minutes (installs ffmpeg, builds the Angular app).
When it's up:

- App: <http://localhost:8000>
- Django admin: <http://localhost:8000/admin/>
- RQ dashboard: <http://localhost:8000/django-rq/>

Database migrations and `collectstatic` run automatically on backend startup.

### Create an admin user

```bash
docker compose exec backend python manage.py createsuperuser
```

Then log into <http://localhost:8000/admin/> and upload a video. The `worker`
service picks it up and generates the 120p/360p/720p/1080p versions +
thumbnail. Watch it happen with:

```bash
docker compose logs -f worker
```

Registration/password-reset emails are printed to the backend logs by default
(console email backend), so you can grab verification links without SMTP:

```bash
docker compose logs -f backend
```

### Stop / reset

```bash
docker compose down           # stop, keep data
docker compose down -v        # stop and DELETE the db + media volumes
```

> If you change `DATABASE_USER` / `DATABASE_PASSWORD` after the first run, you
> must `docker compose down -v` — Postgres only applies credentials when it
> initializes an empty data volume.

## Adding your `.env`

Everything runs with safe defaults, so no `.env` is required for local testing.
For real values (secret key, DB password, SMTP, your domain):

```bash
cp .env.example .env
# edit .env, then:
docker compose up --build
```

`docker compose` reads `.env` from this directory automatically and injects the
values into the `backend` and `worker` services.

> Wrap any value that contains a `$` in single quotes (`SECRET_KEY='ab$cd'`).
> Unquoted, compose reads `$cd` as a variable, warns
> `The "cd" variable is not set` and silently truncates the value.

## Deploying to your server (videoflix.marius-katzer.com)

1. Point the DNS `A` record of `videoflix.marius-katzer.com` at the server.
2. Clone this repo on the server, install Docker + the Compose plugin.
3. Create a real `.env` (see `.env.example`) with `DEBUG=False`, a strong
   `SECRET_KEY`, DB/Redis passwords, SMTP creds and
   `FRONTEND_URL=https://videoflix.marius-katzer.com`.
4. `docker compose up -d --build` — the app now answers on `127.0.0.1:8000`.
5. Add a host nginx site, e.g. `/etc/nginx/sites-available/videoflix.marius-katzer.com`:

   ```nginx
   server {
       listen 80;
       server_name videoflix.marius-katzer.com;

       client_max_body_size 2G;   # video uploads through the admin

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 300s;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/videoflix.marius-katzer.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d videoflix.marius-katzer.com   # adds HTTPS
   ```

The `X-Forwarded-Proto` header matters: Django uses it to build `https://`
media URLs (otherwise the browser blocks the videos as mixed content).
