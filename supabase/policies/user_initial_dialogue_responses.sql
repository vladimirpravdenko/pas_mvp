ALTER TABLE user_initial_dialogue_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own initial responses"
  ON user_initial_dialogue_responses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
