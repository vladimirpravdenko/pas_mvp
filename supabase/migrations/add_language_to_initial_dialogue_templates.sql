ALTER TABLE initial_dialogue_templates
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
