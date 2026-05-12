# Migración: Normalización de Fechas de Noticias

## 🎯 Objetivo

Resolver el problema de fechas incorrectas en las noticias (aparecer como si fueran de otro año) mediante la normalización consistente de fechas en todo el sistema.

## 📋 Cambios Implementados

### 1. **Helper de Utilidades de Fecha** (`src/common/utils/date.utils.ts`)

Funciones creadas:
- `parsePublishedDate(input)`: Parsea diferentes formatos de fecha
- `normalizeDate(input, context)`: Normaliza y valida fechas, con fallback a fecha actual
- `isValidDate(date)`: Valida si una fecha es válida
- `extractPublishedDate(item, context)`: Extrae fecha de múltiples fuentes
- `serializeRawDate(input)`: Serializa el valor raw para guardarlo

**Validaciones automáticas:**
- ✅ Fechas futuras (>1 día) → usa fecha actual
- ✅ Fechas muy antiguas (<2015) → usa fecha actual
- ✅ Formatos soportados: ISO, RFC 822/2822, timestamps, strings personalizados

### 2. **Entidad NewsItem Actualizada**

```typescript
// Nuevo campo agregado
@Column({ type: 'timestamptz' })
publishedAt: Date;  // Ahora es NOT NULL

@Column({ length: 500, nullable: true })
rawPublishedAt?: string;  // Para debugging
```

### 3. **Scrapers Actualizados**

Todos los scrapers ahora usan normalización:
- ✅ `RssScraper`: Normaliza `isoDate`, `pubDate`, `date`
- ✅ `HtmlScraper`: Extrae de `time[datetime]` y meta tags
- ✅ `BiobioScraper`: Normaliza `raw_post_date`, `post_date`
- ✅ `GenericWordpressScraper`: Normaliza `date_gmt`

### 4. **NewsService Mejorado**

- `buildPersistableNewsPatch`: Usa normalización automática
- `fixExistingDates()`: Método nuevo para migrar datos existentes

### 5. **Nuevo Endpoint**

```http
POST /news/fix-dates?limit=1000
```

Corrige fechas de noticias existentes.

## 🚀 Instrucciones de Migración

### Paso 1: Aplicar Cambios en Base de Datos

Ejecuta el script SQL de migración:

```bash
psql -U tu_usuario -d tu_database -f scripts/normalize_dates_migration.sql
```

O desde pgAdmin/DBeaver, ejecuta el contenido de `scripts/normalize_dates_migration.sql`.

**Este script:**
1. Agrega columna `raw_published_at`
2. Guarda fechas originales como backup
3. Corrige fechas null, futuras y antiguas
4. Hace `published_at` NOT NULL
5. Crea índices para mejor performance

### Paso 2: Reiniciar el Backend

```bash
cd news-scraper-api
npm install  # Si es necesario
npm run build
npm run start
```

### Paso 3: Ejecutar Migración de Datos (Opcional)

Si quieres revalidar todas las fechas desde el backend:

```bash
curl -X POST http://localhost:3000/news/fix-dates?limit=2000
```

Respuesta esperada:
```json
{
  "processed": 2000,
  "fixed": 45,
  "unchanged": 1955
}
```

### Paso 4: Scraping Nuevo

Las nuevas noticias scrapeadas ya tendrán fechas normalizadas automáticamente:

```bash
curl -X POST http://localhost:3000/news/scrape
```

## 🔍 Verificación

### Verificar en Base de Datos

```sql
-- Ver distribución de fechas
SELECT 
    DATE(published_at) as fecha,
    COUNT(*) as cantidad
FROM news_items
GROUP BY DATE(published_at)
ORDER BY fecha DESC
LIMIT 10;

-- Verificar que no haya fechas futuras o antiguas
SELECT COUNT(*) as fechas_problematicas
FROM news_items
WHERE published_at > CURRENT_TIMESTAMP + INTERVAL '1 day'
   OR published_at < '2015-01-01';
-- Debería retornar 0

-- Ver noticias con raw_published_at diferente a published_at
SELECT 
    id, 
    title, 
    raw_published_at, 
    published_at,
    created_at
FROM news_items
WHERE raw_published_at IS NOT NULL
  AND raw_published_at::TIMESTAMP != published_at
LIMIT 10;
```

### Verificar en Frontend

Las noticias deberían aparecer ordenadas correctamente por fecha:

```typescript
// En tu frontend
const formattedDate = new Date(news.publishedAt).toLocaleString('es-CL');
```

### Verificar en n8n

Las noticias enviadas a n8n ahora tendrán `publishedAt` siempre válido.

## 📊 Logging

El sistema ahora registra warnings cuando:
- No se puede parsear una fecha
- Se detecta una fecha futura
- Se detecta una fecha muy antigua

Ejemplo de log:
```
[DateUtils] No se pudo parsear fecha: "invalid-date" [BioBio:Título de la noticia]
[DateUtils] Fecha en el futuro detectada: 2027-05-05T... [CHV Noticias:...]
```

## 🔄 Flujo de Normalización

```
┌─────────────────┐
│  RSS/HTML Feed  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Scraper parse  │ ◄─── normalizeDate()
│  raw date       │ ◄─── serializeRawDate()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NewsService    │ ◄─── normalizeDate() en patch
│  saveScraped    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  news_items DB  │
│  publishedAt    │ ✅ Siempre válido
│  rawPublishedAt │ 📝 Para debugging
└─────────────────┘
```

## ⚠️ Notas Importantes

1. **Backup**: Si ya tienes datos en producción, haz un backup antes de ejecutar la migración SQL.

2. **TypeORM Sync**: Si tienes `synchronize: true` en TypeORM, el esquema se actualizará automáticamente. Pero aún necesitas ejecutar el script SQL para corregir datos existentes.

3. **Índices**: La migración crea índices que mejorarán significativamente el performance de queries con ORDER BY publishedAt.

4. **rawPublishedAt**: Este campo es opcional y solo para debugging. No lo uses para ordenar o filtrar.

## 🐛 Troubleshooting

### Error: "null value in column publishedAt violates not-null constraint"

**Causa**: Intentaste insertar una noticia sin fecha.

**Solución**: Los scrapers ahora siempre retornan una fecha válida. Si persiste:
```typescript
// En el scraper, asegurar:
const publishedAt = normalizeDate(rawDate, `${source.name}:${title}`);
```

### Error: Las fechas siguen apareciendo incorrectas

**Solución**:
1. Ejecuta el endpoint de migración: `POST /news/fix-dates?limit=5000`
2. Verifica los logs para ver qué fechas no se pueden parsear
3. Revisa el campo `rawPublishedAt` para ver el valor original

### Las nuevas noticias tienen fechas incorrectas

**Causa**: El feed source puede estar enviando fechas mal formateadas.

**Solución**: Revisa los logs para ver el warning específico. Luego actualiza `parsePublishedDate()` en `date.utils.ts` para soportar ese formato.

## 📈 Mejoras Futuras

- [ ] Dashboard de monitoreo de calidad de fechas
- [ ] Alertas automáticas para fechas sospechosas
- [ ] Machine learning para detectar patrones de fechas incorrectas por fuente
- [ ] API endpoint para revisar noticias con fechas corregidas

## ✅ Checklist de Implementación

- [x] Crear helper de utilidades de fecha
- [x] Actualizar entidad NewsItem
- [x] Actualizar todos los scrapers
- [x] Actualizar NewsService
- [x] Agregar endpoint de migración
- [x] Crear script SQL de migración
- [x] Crear índices de base de datos
- [ ] Ejecutar migración en base de datos
- [ ] Probar en desarrollo
- [ ] Desplegar a producción
- [ ] Ejecutar fix-dates en producción
- [ ] Verificar en frontend
- [ ] Verificar en n8n

---

**Última actualización**: 2026-05-05
**Autor**: Sistema de normalización de fechas
