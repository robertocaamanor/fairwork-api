-- Audit + repair script for legacy/incomplete rows in news_items.
-- Safe to run multiple times (idempotent for repaired fields).

BEGIN;

-- 1) Audit snapshot before repair.
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE "sourceName" IS NULL OR btrim("sourceName") = '') AS missing_source_name,
  COUNT(*) FILTER (WHERE "sourceUrl" IS NULL OR btrim("sourceUrl") = '') AS missing_source_url,
  COUNT(*) FILTER (WHERE category IS NULL) AS missing_category,
  COUNT(*) FILTER (
    WHERE "originalUrl" ILIKE '%news.google.com/%' AND ("resolvedUrl" IS NULL OR btrim("resolvedUrl") = '')
  ) AS unresolved_google_items
FROM news_items;

-- 2) Repair rows that still have missing source/category metadata.
WITH candidates AS (
  SELECT
    id,
    COALESCE(NULLIF("resolvedUrl", ''), NULLIF("originalUrl", '')) AS best_url,
    lower(regexp_replace(
      regexp_replace(COALESCE(NULLIF("resolvedUrl", ''), NULLIF("originalUrl", ''), ''), '^https?://', ''),
      '/.*$',
      ''
    )) AS host,
    lower(
      concat_ws(' ',
        COALESCE("resolvedSourceDomain", ''),
        COALESCE("title", ''),
        COALESCE("summary", ''),
        COALESCE("content", '')
      )
    ) AS text_blob
  FROM news_items
  WHERE
    "sourceName" IS NULL OR btrim("sourceName") = '' OR
    "sourceUrl" IS NULL OR btrim("sourceUrl") = '' OR
    category IS NULL
)
UPDATE news_items n
SET
  "sourceName" = COALESCE(
    NULLIF(n."sourceName", ''),
    CASE
      WHEN regexp_replace(c.host, '^www\.', '') <> ''
        THEN initcap(replace(split_part(regexp_replace(c.host, '^www\.', ''), '.', 1), '-', ' '))
      ELSE 'Fuente desconocida'
    END
  ),
  "sourceUrl" = COALESCE(
    NULLIF(n."sourceUrl", ''),
    CASE
      WHEN COALESCE(c.best_url, '') ~ '^https?://'
        THEN regexp_replace(c.best_url, '^(https?://[^/]+).*$','\1')
      WHEN COALESCE(c.best_url, '') <> ''
        THEN c.best_url
      ELSE 'https://desconocido.local'
    END
  ),
  category = COALESCE(
    n.category,
    (
    CASE
      WHEN c.text_blob LIKE '%cooperativa%' OR c.text_blob LIKE '%adnradio%' OR c.text_blob LIKE '% radio %' THEN 'radio'
      WHEN c.text_blob LIKE '%musica%' OR c.text_blob LIKE '% cantante %' OR c.text_blob LIKE '%spotify%' THEN 'musica'
      WHEN c.text_blob LIKE '%streaming%' OR c.text_blob LIKE '%netflix%' OR c.text_blob LIKE '%prime video%' OR c.text_blob LIKE '%disney+%' OR c.text_blob LIKE '%hbo%' THEN 'streaming'
      WHEN c.text_blob LIKE '%internacional%' THEN 'tv_internacional'
      WHEN c.text_blob LIKE '%television%' OR c.text_blob LIKE '%canal 13%' OR c.text_blob LIKE '%mega%' OR c.text_blob LIKE '%tvn%' OR c.text_blob LIKE '%chv%' THEN 'tv_chilena'
      ELSE 'farandula'
    END
    )::news_items_category_enum
  ),
  "updatedAt" = NOW()
FROM candidates c
WHERE n.id = c.id;

-- 3) Audit snapshot after repair.
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE "sourceName" IS NULL OR btrim("sourceName") = '') AS missing_source_name,
  COUNT(*) FILTER (WHERE "sourceUrl" IS NULL OR btrim("sourceUrl") = '') AS missing_source_url,
  COUNT(*) FILTER (WHERE category IS NULL) AS missing_category,
  COUNT(*) FILTER (
    WHERE "originalUrl" ILIKE '%news.google.com/%' AND ("resolvedUrl" IS NULL OR btrim("resolvedUrl") = '')
  ) AS unresolved_google_items
FROM news_items;

COMMIT;
