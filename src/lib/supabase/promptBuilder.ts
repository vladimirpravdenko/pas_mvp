import { supabase } from '@/lib/supabase';

export interface DialogueResponse {
  initial_dialogue_templates: {
    label: string;
  };
  response: string;
}

/**
 * Generate a descriptive song prompt based on a user's initial dialogue responses.
 * Fetches all responses from `user_initial_dialogue_responses` for the given user
 * and assembles them into a single prompt string.
 */
export async function generateSongPrompt(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user_initial_dialogue_responses')
    .select('initial_dialogue_templates.label, response')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch dialogue responses:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return '';
  }

  // Assemble the prompt using the collected responses.
  const lines = data.map(
    (entry) => `${entry.initial_dialogue_templates.label.trim()}: ${String(entry.response).trim()}`,
  );

  return `Use the following user preferences to craft a personalised song.\n${lines.join('\n')}`;
}
