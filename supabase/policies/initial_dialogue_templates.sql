-- Enable RLS and allow only admins to modify templates
ALTER TABLE initial_dialogue_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can modify dialogue templates"
  ON initial_dialogue_templates
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Authenticated users read active templates"
  ON initial_dialogue_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active);
