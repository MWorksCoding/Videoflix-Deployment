# Videoflix — Dockerized Fullstack Deployment

Runs the whole stack with Docker Compose:

| Service    | What it is                                | URL / Port (host)          |
|------------|-------------------------------------------|----------------------------|
| `frontend` | Angular app served by nginx               | http://localhost           |
| `backend`  | Django REST API (gunicorn)                | http://127.0.0.1:8000      |
| `worker`   | RQ worker running ffmpeg video conversion | –                          |
| `db`       | PostgreSQL 16                             | localhost:5433 (inspect)   |
| `redis`    | Redis 7 (cache + task queue)              | – (internal)               |

Frontend and backend run as **separate origins** (the browser calls the API
directly), matching the production setup with two subdomains.

## Run it locally

```bash
# from this directory (where docker-compose.yml lives)
docker compose up --build
```

First build takes a few minutes (installs ffmpeg, builds the Angular app).
When it's up:

- Frontend: <http://localhost>
- Backend API / admin: <http://127.0.0.1:8000/admin/>
- RQ dashboard: <http://127.0.0.1:8000/django-rq/>

Database migrations run automatically on backend startup.

### Create an admin user

```bash
docker compose exec backend python manage.py createsuperuser
```

Then log into <http://127.0.0.1:8000/admin/> and upload a video. The `worker`
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

## Deploying to your server

1. Copy this folder (with both repos) to the server, install Docker + the
   Compose plugin.
2. Create a real `.env` (see `.env.example`) with `DEBUG=False`, a strong
   `SECRET_KEY`, DB/Redis passwords, SMTP creds, and your domain in
   `DJANGO_ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS`.
3. Build the frontend for production so it targets your API subdomain instead
   of `127.0.0.1:8000`. In `docker-compose.yml`, set the frontend build arg:

   ```yaml
   frontend:
     build:
       context: ./videoflix-frontend
       args:
         CONFIGURATION: production   # uses src/environments/environments.ts
   ```

4. `docker compose up --build -d`

### Production notes (not needed for local testing)

- With `DEBUG=False`, Django no longer serves `/static/` and `/media/`. Put a
  reverse proxy (nginx / Traefik) in front to serve those and terminate TLS,
  or add WhiteNoise for static files. The media volume is already shared
  between `backend` and `worker`.
- Point your two subdomains at the server and proxy them to the `frontend`
  (`:80`) and `backend` (`:8000`) services.
