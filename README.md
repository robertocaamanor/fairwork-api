# news-scraper-api

Backend en NestJS para recopilar noticias desde RSS, scraping HTML y WordPress, normalizar resultados y exponerlos para frontend tipo TweetDeck y automatizaciones n8n.

## Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Axios
- Cheerio
- rss-parser
- class-validator
- class-transformer

## Arquitectura

```text
src/
  app.module.ts
  main.ts
  seed.ts
  editorial/
    editorial.module.ts
    editorial.controller.ts
    editorial.service.ts
    dto/
      create-editorial-review.dto.ts
      update-editorial-review-status.dto.ts
      mark-editorial-published.dto.ts
    entities/
      editorial-review.entity.ts
  news/
    news.module.ts
    news.controller.ts
    news.service.ts
    dto/
      news-item.dto.ts
      create-source.dto.ts
    entities/
      news-item.entity.ts
      news-source.entity.ts
    scrapers/
      scraper.interface.ts
      rss.scraper.ts
      html.scraper.ts
      fotech.scraper.ts
      generic-wordpress.scraper.ts
  sources/
    sources.module.ts
    sources.controller.ts
    sources.service.ts
    dto/
      update-source.dto.ts
  scheduler/
    scheduler.module.ts
    scheduler.service.ts
```

## Requisitos

- Node.js 20+
- PostgreSQL 14+

## Instalacion local

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Variables de entorno

Usa este archivo `.env`:

```env
DATABASE_URL=
DATABASE_SSL=false
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=news_monitor
PORT=3000
FRONTEND_URL=http://localhost:5173
N8N_URL=http://localhost:8080
N8N_WEBHOOK_URL=http://localhost:8080/webhook/generate-article
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=24h
```

Notas:

- Si defines `DATABASE_URL`, la API la prioriza sobre `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME`.
- En Railway normalmente conviene usar `DATABASE_URL` y `DATABASE_SSL=true`.
- Define `JWT_SECRET` con un valor largo y estable antes de desplegar a producción.

## Autenticación JWT

La API usa JWT Bearer para proteger todos los endpoints, excepto:

- `POST /auth/login`
- `GET /`

Usuarios iniciales creados automáticamente si no existen en la base de datos:

- `admin / admin123`: administrador, puede enviar artículos a n8n y gestionar usuarios.
- `demo / demo123`: usuario de solo consulta, sin permiso para enviar a n8n.

### Login

`POST /auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "...",
    "username": "admin",
    "isAdmin": true,
    "canSendToN8n": true,
    "isActive": true
  }
}
```

Luego envía el token en `Authorization: Bearer <jwt>`.

### Gestión de usuarios

Solo `admin` puede gestionar usuarios.

- `GET /users`: lista usuarios.
- `POST /users`: crea usuarios.
- `PATCH /users/:id`: actualiza permisos, password o estado.

Ejemplo para crear un usuario que no puede enviar a n8n:

```json
{
  "username": "lector",
  "password": "lector123",
  "isAdmin": false,
  "canSendToN8n": false
}
```

Ejemplo para crear un usuario con permiso de envío a n8n:

```json
{
  "username": "editor",
  "password": "editor123",
  "isAdmin": false,
  "canSendToN8n": true
}
```

## Scripts npm

- `npm run start:dev`: modo desarrollo
- `npm run build`: compilar TypeScript
- `npm run start:prod`: ejecutar build
- `npm run seed`: seed inicial de fuentes por categoria
- `npm run test`: tests unitarios

## Deploy en Railway

1. Crea un nuevo proyecto en Railway y conecta este repositorio.
2. Agrega un servicio PostgreSQL dentro del mismo proyecto.
3. En el servicio de la API define estas variables:
  - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
  - `DATABASE_SSL=true`
  - `PORT=${{RAILWAY_TCP_PROXY_PORT}}` o deja que Railway inyecte `PORT` automaticamente.
  - `FRONTEND_URL=https://tu-frontend.railway.app`
  - `N8N_URL` y `N8N_WEBHOOK_URL` segun tu flujo.
4. Railway detectara el `Dockerfile` y construira la imagen automaticamente.
5. Una vez desplegado, abre la URL publica y verifica que responda `Hello World!` en `/`.

Si necesitas poblar fuentes iniciales tras el primer deploy, ejecuta un shell en Railway y corre `npm run seed`.

## Seed inicial

El seed crea fuentes RSS iniciales para categorias:

- TV chilena
- TV internacional
- Musica
- Farandula
- Streaming
- Radio

Ejecuta:

```bash
npm run seed
```

## Endpoints

### News

- `GET /news/latest`
  - Retorna noticias recientes agrupadas por categoria.

- `GET /news?category=tv_chilena`
  - Filtra por categoria. Tambien soporta `limit` opcional.

- `GET /news?q=rating&category=tv_chilena&source=Fotech&minScore=60&status=new&limit=20`
  - Busqueda avanzada con filtros opcionales.
  - Campos consultados por texto (`q`): `title`, `summary`, `content`, `sourceName`, `originalUrl`.

- `GET /news/latest?q=festival&category=musica&source=Fotech`
  - Retorna agrupado por categoria (o una categoria si se envia `category`) con filtros opcionales.

- `GET /news/related?newsId=<id>&limit=10`
  - Busca noticias relacionadas excluyendo la noticia original.

- `GET /news/related?q=Vina%202026&category=musica&source=Fotech`
  - Busqueda manual de relacionadas por texto/categoria/fuente.

- `POST /news/scrape`
  - Ejecuta scraping manual de todas las fuentes activas.

- `POST /news/:id/send-to-n8n`
  - Envia inmediatamente la noticia seleccionada al webhook de n8n.
  - Si el webhook responde OK, actualiza `status` a `sent_to_n8n`.
  - Si falla n8n, devuelve error y no cambia el estado.

- `PATCH /news/:id/status`
  - Cambia estado de una noticia.
  - Body:
  ```json
  {
    "status": "selected"
  }
  ```

- `GET /news/n8n`
  - Devuelve solo noticias con `status = new` y `score >= 70`.

### Sources

- `POST /sources`
  - Crea fuente.
  - Body ejemplo:
  ```json
  {
    "name": "Fotech",
    "url": "https://www.fotech.cl",
    "type": "html",
    "category": "tv_chilena",
    "enabled": true,
    "selectors": {
      "article": "article",
      "title": "h2 a",
      "summary": "p",
      "image": "img",
      "link": "a",
      "date": "time"
    }
  }
  ```

- `GET /sources`
  - Lista fuentes.

- `PATCH /sources/:id`
  - Edita/activa/desactiva fuente.

### Editorial

- `POST /editorial/reviews`
  - Crea revision editorial desde propuesta n8n.
  - Si ya existe revision activa para `newsId` u `originalUrl`, devuelve la existente.

- `GET /editorial/reviews?status=pending_review|approved|rejected|draft_created`
  - Lista revisiones por estado y soporta filtros (`category`, `minScore`, `limit`).

- `GET /editorial/reviews/pending`
  - Retorna solo pendientes.

- `GET /editorial/reviews/approved`
  - Retorna solo aprobadas para el paso de publicacion en n8n.

- `PATCH /editorial/reviews/:id/status`
  - Aprueba o rechaza revision.

- `PATCH /editorial/reviews/:id/published`
  - Marca revision como `draft_created` con datos de WordPress (`wordpressPostId`, `wordpressLink`).

- `DELETE /editorial/reviews/:id`
  - Elimina revision (limpieza local).

## Scheduler

- Job automatico cada 15 minutos (`@Cron(CronExpression.EVERY_15_MINUTES)`) para ejecutar scraping de fuentes activas.

## Reglas de deduplicacion y scoring

- Deduplicacion por `originalUrl` unico.
- Scoring simple:
  - +30 si contiene: `Mega`, `CHV`, `TVN`, `Canal 13`, `rating`, `matinal`, `reality`, `Viña`, `festival`.
  - +20 si contiene: `estreno`, `final`, `confirmo`, `anuncio`, `polemica`.
  - +10 si tiene imagen.
  - Maximo 100.

## Integracion con n8n

1. Crea un workflow con nodo `HTTP Request` (GET):
  - Si n8n corre local: `http://localhost:3000/news/n8n`
  - Si n8n corre en Docker: `http://host.docker.internal:3000/news/n8n`

2. Itera resultados y procesa destino (Slack, DB, webhook, etc).

3. Opcional: luego de enviar, actualiza estado con:
   - `PATCH /news/:id/status` con body `{"status":"sent_to_n8n"}`

4. Envio inmediato desde frontend monitor:
  - `POST /news/:id/send-to-n8n`
  - El frontend puede usar este endpoint para disparar el workflow de n8n en tiempo real.

### Enriquecimiento antes de n8n

Cuando una noticia viene desde URLs intermedias (ej. Google News RSS), el backend intenta enriquecerla:

- Resuelve URL final (`resolvedUrl`) cuando detecta patrones de Google News.
- Detecta dominio final (`resolvedSourceDomain`).
- Scrapea articulo original y extrae:
  - `fullContent`
  - `cleanContent`
  - `extractedImageUrl`
  - `author` (si existe)
  - `publishedAt` (si existe)

Reglas principales:

- Si `cleanContent` supera 400 caracteres, se usa como contenido principal.
- Si `imageUrl` esta vacio y se extrae imagen, se usa `extractedImageUrl`.
- Si el titulo scrapeado es mejor y no vacio, puede reemplazar el titulo RSS.
- Dedupe considera `originalUrl`, `resolvedUrl` y titulo normalizado.

Si falla el enriquecimiento de una noticia, el scraping global no se rompe y continua con las demas fuentes.

### Payload enriquecido enviado a n8n

`POST /news/:id/send-to-n8n` envia:

```json
{
  "id": "uuid",
  "title": "Titulo final",
  "summary": "Resumen",
  "content": "cleanContent || fullContent || content || summary",
  "sourceName": "Fuente",
  "category": "tv_chilena",
  "originalUrl": "https://news.google.com/...",
  "resolvedUrl": "https://sitio-original.com/articulo",
  "imageUrl": "https://...jpg",
  "publishedAt": "2026-05-05T00:00:00.000Z",
  "score": 85,
  "status": "selected"
}
```

### Limitaciones

- Algunos sitios bloquean scraping por bot/protecciones anti-crawler.
- Algunas URLs intermedias no exponen enlace final de forma parseable.
- En esos casos se conserva la URL original y el flujo sigue sin fallar.

## Flujo editorial

1. n8n crea propuesta en `POST /editorial/reviews`.
2. Frontend lista `pending_review`.
3. Editor aprueba/rechaza.
4. n8n lee `GET /editorial/reviews/approved`.
5. n8n crea borrador en WordPress.
6. n8n marca `PATCH /editorial/reviews/:id/published`.

## Ejemplos de busqueda

- `GET /news?category=tv_chilena&q=rating`
- `GET /news?category=musica&q=festival`
- `GET /news?source=Fotech&q=Canal%2013`
- `GET /news/latest?category=tv_chilena&q=matinal`
- `GET /news/related?newsId=<uuid>`
- `GET /news/related?q=rating&source=Fotech`

Conectividad recomendada:

- Frontend (host): `http://localhost:5173`
- Backend (host): `http://localhost:3000`
- n8n (Docker): `http://localhost:8080`
- n8n -> backend desde contenedor: `http://host.docker.internal:3000`

## Docker Desktop

### Levantar API + PostgreSQL

```bash
docker compose up --build -d
```

### Ver logs

```bash
docker compose logs -f api
```

### Ejecutar seed en host (recomendado)

```bash
npm run seed
```

### Bajar servicios

```bash
docker compose down
```
