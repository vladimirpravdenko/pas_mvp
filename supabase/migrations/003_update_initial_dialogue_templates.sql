ALTER TABLE initial_dialogue_templates
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS "order" INT NOT NULL DEFAULT 0;

UPDATE initial_dialogue_templates
  SET "order" = row_number() OVER (ORDER BY created_at)
  WHERE "order" = 0;
