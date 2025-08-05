import { supabase } from '@/lib/supabaseClient';
import type { UserInitialProfile } from '@/types/userInitialProfile';

/**
 * Generate a descriptive song prompt based on a user's initial profile.
 * Fetches the profile from `user_initial_dialogue_responses` for the given user
 * and assembles it into a single prompt string.
 */
export async function generateSongPrompt(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user_initial_dialogue_responses')
    .select('responses')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch dialogue responses:', error);
    throw error;
  }

  const profile = data?.responses as UserInitialProfile | undefined;
  if (!profile) {
    return '';
  }

  const lines = [
    `Emotional keywords: ${profile.emotional_keywords.join(', ')}`,
    `Emotional valence: ${profile.emotional_valence.join(', ')}`,
    `Core images or concepts: ${profile.core_images_or_concepts.join(', ')}`,
    `Preferred music styles: ${profile.preferred_music_styles.join(', ')}`,
    `Favorite artists: ${profile.favorite_artists.join(', ')}`,
    `Favorite songs: ${profile.favorite_songs.join(', ')}`,
  ];

  return `Use the following user profile to craft a personalised song.\n${lines.join('\n')}`;
}
