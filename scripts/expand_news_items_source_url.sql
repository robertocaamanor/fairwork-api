ALTER TABLE news_items
ALTER COLUMN "sourceUrl" TYPE text;

SELECT
  column_name,
  data_type,
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'news_items'
  AND column_name = 'sourceUrl';