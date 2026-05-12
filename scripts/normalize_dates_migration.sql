-- Migración: Normalización de fechas de noticias
-- Fecha: 2026-05-05
-- Descripción: Normaliza publishedAt y usa rawPublishedAt para debugging

-- 1. Guardar las fechas originales en rawPublishedAt (antes de modificar)
UPDATE news_items 
SET "rawPublishedAt" = "publishedAt"::TEXT
WHERE "rawPublishedAt" IS NULL AND "publishedAt" IS NOT NULL;

-- 2. Actualizar publishedAt para noticias con fechas null (usar createdAt como fallback)
UPDATE news_items 
SET "publishedAt" = "createdAt"
WHERE "publishedAt" IS NULL;

-- 3. Corregir fechas futuras (más de 1 día en el futuro)
UPDATE news_items 
SET "publishedAt" = CURRENT_TIMESTAMP,
    "rawPublishedAt" = COALESCE("rawPublishedAt", "publishedAt"::TEXT)
WHERE "publishedAt" > CURRENT_TIMESTAMP + INTERVAL '1 day';

-- 4. Corregir fechas muy antiguas (antes de 2015)
UPDATE news_items 
SET "publishedAt" = "createdAt",
    "rawPublishedAt" = COALESCE("rawPublishedAt", "publishedAt"::TEXT)
WHERE "publishedAt" < '2015-01-01'::TIMESTAMP;

-- 5. Hacer publishedAt NOT NULL (después de corregir todos los valores)
ALTER TABLE news_items 
ALTER COLUMN "publishedAt" SET NOT NULL;

-- 6. Crear índice en publishedAt para mejorar performance de ordenamiento
CREATE INDEX IF NOT EXISTS "idx_news_items_publishedAt" 
ON news_items ("publishedAt" DESC);

-- 7. Crear índices compuestos para queries más comunes
CREATE INDEX IF NOT EXISTS "idx_news_items_category_publishedAt" 
ON news_items (category, "publishedAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_news_items_status_score_publishedAt" 
ON news_items (status, score DESC, "publishedAt" DESC);

-- Verificar resultados
SELECT 
    COUNT(*) as total_noticias,
    COUNT(CASE WHEN "publishedAt" IS NULL THEN 1 END) as con_fecha_null,
    COUNT(CASE WHEN "publishedAt" > CURRENT_TIMESTAMP + INTERVAL '1 day' THEN 1 END) as fechas_futuras,
    COUNT(CASE WHEN "publishedAt" < '2015-01-01' THEN 1 END) as fechas_antiguas,
    COUNT(CASE WHEN "rawPublishedAt" IS NOT NULL THEN 1 END) as con_raw_date
FROM news_items;
