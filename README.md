# Trivallo

Discover and book the best excursions and activities in Marrakech, Ouarzazate and Merzouga.
English and French, prices in EUR. Bookings are requests confirmed by an admin; there is no online payment in v1.

## Repository layout

| Path | What it is |
|---|---|
| `backend/` | Spring Boot 4 API (Java 21, Maven), one modular monolith |
| `frontend/` | Angular 22 SSR app, EN/FR, Tailwind ([frontend/README.md](frontend/README.md)) |
| `infra/keycloak/` | Development realm imported into Keycloak on start |
| `infra/postgres/init/` | Creates the Keycloak database on the first Postgres start |
| `infra/nginx/` | Local reverse proxy: `/api` to the backend, the rest to Angular SSR |
| `compose.yaml` | Local stack: Postgres, Keycloak, and optionally backend + frontend + Nginx |

## Run it locally

Prerequisites: JDK 21, Maven 3.9+, Docker.

```bash
cp .env.example .env                       # local passwords; .env is git-ignored
docker compose up -d                       # Postgres on :5432, Keycloak on :8081
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Then the frontend, in another terminal:

```bash
cd frontend
npm ci && npm start                        # http://localhost:4200, /api proxied to :8080
```

- API: http://localhost:8080/api/v1/cities
- Swagger UI: http://localhost:8080/swagger-ui.html (dev only, disabled in `prod`)
- Keycloak admin console: http://localhost:8081 (`admin` / `admin`)

To run everything in containers like production: `docker compose --profile app up -d --build`,
then open http://localhost:8000 (Nginx in front of the frontend and the API).

The `dev` profile loads a few sample activities from `db/devdata` on top of the real migrations.
Use a separate database for anything that runs with the `prod` profile: Flyway will refuse to start a
`prod` app against a database that has the dev sample data applied.

### Development accounts (realm `trivallo`)

| User | Password | Roles |
|---|---|---|
| `admin@trivallo.local` | `admin` | `TRAVELLER`, `ADMIN` |
| `traveller@trivallo.local` | `traveller` | `TRAVELLER` |

New sign-ups get `TRAVELLER` automatically. Get a token for manual testing:

```bash
curl -s -d grant_type=password -d client_id=trivallo-web \
  -d username=admin@trivallo.local -d password=admin \
  http://localhost:8081/realms/trivallo/protocol/openid-connect/token
```

The realm file is for development only: it has test users and the password grant enabled on
`trivallo-web`. The production realm is set up separately in week 4.

Keycloak imports the realm file only on first start. After pulling a change to it (for example new
redirect URIs), recreate Keycloak's data: `docker compose down -v && docker compose up -d`.

### Admin

Open http://localhost:8000/en/admin (or http://localhost:4200/admin with `ng serve`) and sign in as
`admin@trivallo.local`. It manages activities (texts in EN/FR, prices, photos, publishing), cities
(including hero photos) and categories. Uploaded photos are stored on disk under `MEDIA_DIR`
(Docker volume `media-data`) and served at `/media/**`.

## Backend structure

Package by feature, each with Controller → Service → Repository, DTOs as records and MapStruct mappers.
Entities never leave the service layer.

```
com.trivallo
├── catalog
│   ├── city        public city pages
│   ├── category    filter options
│   └── activity    search with filters, detail page
└── shared
    ├── config      locale resolution, CORS, OpenAPI
    ├── security    Keycloak JWT resource server, realm role mapping
    ├── i18n        supported locales, translation fallback to English
    ├── exception   base exceptions
    └── web         @RestControllerAdvice (RFC 9457 ProblemDetail), PageResponse
```

`booking`, `review`, `user` and `admin` modules arrive in weeks 2 to 4.

### Conventions

- **Locale:** send `Accept-Language: en` or `fr`. Missing French text falls back to English;
  the detail responses return the `locale` actually used.
- **Translations:** translatable text lives in `*_translation` tables keyed by locale.
- **Money:** `NUMERIC(10,2)` in the database, `BigDecimal` in Java, never floating point.
- **Schema:** only Flyway changes the schema (`ddl-auto: validate`). Never edit an applied migration; add a new one.
- **Errors:** every error is a `ProblemDetail`; validation errors add an `errors` list of `{field, message}`.
- **Logging:** SLF4J; the `prod` profile writes one JSON object per line (Logstash format).
- **Git:** Git Flow (`feature/*` → `develop` → `main`) and Conventional Commits.

## API (v1)

| Endpoint | Access |
|---|---|
| `GET /api/v1/cities`, `GET /api/v1/cities/{slug}` | Public |
| `GET /api/v1/categories` | Public |
| `GET /api/v1/activities?city=&category=&type=&minPrice=&maxPrice=&minDuration=&maxDuration=&page=&size=` | Public |
| `GET /api/v1/activities/{slug}` | Public |
| `/api/v1/admin/activities`, `/cities`, `/categories` (+ image uploads) | `ADMIN` |
| `GET /media/**` (uploaded photos) | Public |
| `/api/v1/me/**`, `/api/v1/bookings/**` | `TRAVELLER` |

The full contract is in Swagger UI.
