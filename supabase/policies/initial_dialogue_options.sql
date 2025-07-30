-- Enable RLS and allow only admins to modify options
ALTER TABLE initial_dialogue_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can modify dialogue options"
  ON initial_dialogue_options
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Authenticated users read options"
  ON initial_dialogue_options
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM initial_dialogue_templates t
      WHERE t.id = template_id
        AND t.is_active
    )
  );
