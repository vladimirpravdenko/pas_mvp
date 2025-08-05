import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import InitialDialogueForm from '@/components/InitialDialogueForm';
import type { UserInitialProfile } from '@/types/userInitialProfile';

const defaultProfile: UserInitialProfile = {
  emotional_keywords: [],
  emotional_valence: [],
  core_images_or_concepts: [],
  preferred_music_styles: [],
  favorite_artists: [],
  favorite_songs: [],
};

const InitialDialogueInner: React.FC = () => {
  const { user } = useAppContext();
  const [profile, setProfile] = useState<UserInitialProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('user_initial_dialogue_responses')
        .select('responses')
        .eq('user_id', user.id)
        .single();
      if (data?.responses) {
        setProfile(data.responses as UserInitialProfile);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="p-4">Loading...</div>;

  return <InitialDialogueForm initialProfile={profile} />;
};

export default function InitialDialoguePage() {
  return (
    <AppProvider>
      <InitialDialogueInner />
    </AppProvider>
  );
}
