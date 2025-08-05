ALTER TABLE IF EXISTS initial_dialogue_templates RENAME TO initial_dialogue_templates_old;

CREATE TABLE IF NOT EXISTS public.initial_dialogue_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.initial_dialogue_templates ("order", type, prompt_text, active) VALUES
  (1, 'emotion', 'Which song always lifts your spirits when you feel down?', TRUE),
  (2, 'metaphor', 'If your mood today were a musical instrument, what would it be?', TRUE),
  (3, 'valence', 'Describe a melody that captures how you feel right now.', TRUE),
  (4, 'rhythm', 'What rhythm mirrors the pace of your day?', TRUE),
  (5, 'memory', 'Share a lyric that has stuck with you recently.', TRUE),
  (6, 'imagery', 'If emotions were colors in a song, which would paint your current mood?', TRUE),
  (7, 'genre', 'Which musical genre best describes your current outlook?', TRUE);
