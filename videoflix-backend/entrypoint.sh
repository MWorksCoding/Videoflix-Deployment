#!/bin/sh
set -e

# Wait for PostgreSQL to accept connections before starting Django.
# DATABASE_HOST / DATABASE_PORT are provided by docker-compose.
DB_HOST="${DATABASE_HOST:-db}"
DB_PORT="${DATABASE_PORT:-5432}"

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT} ..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" >/dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is available."

# Run whatever command was passed (gunicorn, rqworker, migrate, ...)
exec "$@"
