-- Enable RLS and allow users to insert or update only their own rows
ALTER TABLE user_initial_dialogue_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own responses"
  ON user_initial_dialogue_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON user_initial_dialogue_responses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
