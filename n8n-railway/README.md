# n8n en Railway

Servicio aislado para desplegar n8n en Railway usando PostgreSQL persistente.

## Archivos

- `Dockerfile`: usa la imagen oficial de n8n.
- `.env.example`: variables minimas para Railway.
- `railway.json`: build por Dockerfile y healthcheck en `/healthz`.

## Variables recomendadas en Railway

Define estas variables en el servicio de n8n:

```env
N8N_HOST=<tu-subdominio>.up.railway.app
N8N_PROTOCOL=https
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://<tu-subdominio>.up.railway.app
WEBHOOK_URL=https://<tu-subdominio>.up.railway.app
N8N_PROXY_HOPS=1
N8N_ENCRYPTION_KEY=<cadena-larga-y-estable>
GENERIC_TIMEZONE=America/Santiago

DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{Postgres.PGHOST}}
DB_POSTGRESDB_PORT=${{Postgres.PGPORT}}
DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_POSTGRESDB_SSL_ENABLED=true
DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=false

N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=<usuario>
N8N_BASIC_AUTH_PASSWORD=<password-largo>
```

## Despliegue

1. Crea un nuevo servicio en Railway apuntando a la carpeta `n8n-railway`.
2. Agrega un servicio PostgreSQL en el mismo proyecto.
3. Copia las variables del bloque anterior.
4. Haz el primer deploy.
5. Cuando Railway te entregue el dominio publico, actualiza `N8N_HOST`, `N8N_EDITOR_BASE_URL` y `WEBHOOK_URL` con ese dominio exacto.

## Integracion con tu backend

Una vez que n8n quede accesible, ajusta estas variables en el backend [../.env.example](../.env.example):

- `N8N_URL=https://<tu-subdominio>.up.railway.app`
- `N8N_WEBHOOK_URL=https://<tu-subdominio>.up.railway.app/webhook/generate-article`

La segunda URL debe coincidir con el `Production URL` real del nodo `Webhook` en tu workflow.

## Flujo minimo recomendado

1. Crea un workflow con `Webhook` en path `generate-article`.
2. Activa el workflow para que exista production URL.
3. Desde el backend prueba `POST /news/:id/send-to-n8n`.
4. Si recibes 404 en el backend, el workflow no esta activo o `N8N_WEBHOOK_URL` no coincide con el production URL.
