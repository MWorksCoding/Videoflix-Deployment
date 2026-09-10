FROM python:3.12-slim

# Keep Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System dependencies:
#  - ffmpeg            -> video conversion / thumbnails (used by the RQ worker)
#  - postgresql-client -> provides pg_isready for the entrypoint wait-for-db
# (psycopg2-binary ships a precompiled wheel, so no C build toolchain is needed.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install Python dependencies first so this layer is cached between code changes
COPY requirements.txt ./
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the project source
COPY . .

# Entrypoint waits for PostgreSQL, then runs the container command (see CMD / compose)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

# Default command: production WSGI server. The RQ worker service overrides this in compose.
CMD ["gunicorn", "videoflix_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
