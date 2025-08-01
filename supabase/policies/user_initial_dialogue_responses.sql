-- Enable RLS and allow anyone to insert responses
ALTER TABLE user_initial_dialogue_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert responses" 
  ON user_initial_dialogue_responses
  FOR INSERT
  WITH CHECK (true);
