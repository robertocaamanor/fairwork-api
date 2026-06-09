ALTER TABLE news_sources
ALTER COLUMN url TYPE text;

SELECT
  column_name,
  data_type,
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'news_sources'
  AND column_name = 'url';