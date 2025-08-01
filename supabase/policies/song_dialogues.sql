ALTER TABLE song_dialogues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own song_dialogues"
  ON song_dialogues
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
