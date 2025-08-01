ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own songs"
  ON songs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
