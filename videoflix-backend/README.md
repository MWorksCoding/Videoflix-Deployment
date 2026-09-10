# Videoflix

Videoflix is a Django-based web application for uploading and streaming videos in various resolutions. It allows users to register, log in, and manage their video content. The application supports video transcoding to multiple resolutions and thumbnail extraction using FFmpeg.

## Features
- User registration, login, and authentication
- Video upload and transcoding to different resolutions (120p, 360p, 720p, 1080p)
- Thumbnail extraction from uploaded videos
- Video streaming in different resolutions
- Password reset functionality
- Email activation for new users
- RESTful API for user and video management

## Requirements
- Python 3.12+
- Django 5.1.1
- PostgreSQL
- Redis
- FFmpeg

## Setup Instructions

### Backend Setup
Clone the repository
```bash
clone git repository and change directory to the root

bash
Code kopieren
python -m venv env
source env/bin/activate # On Windows use `env\Scripts\activate`
Install the dependencies

bash
Code kopieren
pip install -r requirements.txt
Set up PostgreSQL database

Create a new PostgreSQL database and user.
Update the DATABASES setting in videoflix/settings.py with your database credentials.
Run database migrations

bash
Code kopieren
python manage.py migrate
Create a superuser

bash
Code kopieren
python manage.py createsuperuser
Set up Redis

Install Redis and start the Redis server.
Set up FFmpeg

Install FFmpeg and ensure it is available in your systems PATH.

Configure email settings

Update the email settings in videoflix/settings.py with your email service credentials.
Credetians must be placed in the roor directory.
For this create and set up a .env file in the root directly

The .env file should contain this:

Example:
DEBUG=True
AUTHEMAIL_DEFAULT_EMAIL_FROM=user@test.com
AUTHEMAIL_DEFAULT_EMAIL_BCC=
AUTHEMAIL_EMAIL_HOST=test.testserver.com
AUTHEMAIL_EMAIL_PORT=587
AUTHEMAIL_EMAIL_HOST_USER=user@test.com
AUTHEMAIL_EMAIL_HOST_PASSWORD=test-password1
DATABASE_USER=user
DATABASE_PASSWORD=test-password2
SECRET_KEY=django-123456789

Run the development server

bash
Code kopieren
python manage.py runserver
Frontend Setup

Run the development server

bash
Code kopieren
npm start
Running Workers for Video Processing
Start the Redis worker

bash
Code kopieren
python manage.py rqworker

To deploy the application, you can use any cloud service provider like Google Cloud, AWS, Heroku, or DigitalOcean. Ensure you set the environment variables and configure the necessary services like PostgreSQL and Redis on your server.

Nginx Configuration
Here is an example Nginx configuration for serving the Django application:

nginx

server {
    listen 80;
    server_name test-server.test-server.com;
    rewrite     ^   https://$server_name$request_uri? permanent;
}

# läuft grunsätzlich, aber problem bei den routes
server {
    listen 443 ssl;
    server_name test-server.test-server.com;

    ssl_certificate /etc/letsencrypt/live/test-server.test-server.com;/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test-server.test-server.com;/privkey.pem;

    location / {
        include proxy_params;
        proxy_pass http://127.0.0.1:8000;
    }
}

Supervisor Configuration
Here is an example Supervisor configuration for running the Gunicorn server and Redis worker:

ini
Code kopieren
[program:videoflix-gunicorn]
command=/path/to/your/env/bin/gunicorn videoflix.wsgi:application --bind 127.0.0.1:8000 --workers 3
directory=/path/to/your/project
user=youruser
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/videoflix_gunicorn.log
stderr_logfile=/var/log/supervisor/videoflix_gunicorn_err.log

[program:videoflix-worker]
command=/path/to/your/env/bin/python /path/to/your/project/manage.py rqworker
directory=/path/to/your/project
user=youruser
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/videoflix_worker.log
stderr_logfile=/var/log/supervisor/videoflix_worker_err.log
Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.