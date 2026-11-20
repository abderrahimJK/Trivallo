#!/bin/sh
# Runs once, on the first start of an empty Postgres volume.
# Keycloak gets its own database and user next to the application database.
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE USER ${KEYCLOAK_DB_USER} WITH PASSWORD '${KEYCLOAK_DB_PASSWORD}';
CREATE DATABASE keycloak OWNER ${KEYCLOAK_DB_USER};
SQL
