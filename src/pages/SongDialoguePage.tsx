import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sunoApi } from '@/services/sunoApi';
import { webhookService } from '@/services/webhookService';

const SongDialogueInner: React.FC = () => {
  const { user } = useAppContext();
  const [dialogue, setDialogue] = useState('');
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [generatingSong, setGeneratingSong] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    };
    loadProfile();
  }, [user]);

  const fetchLyrics = async () => {
    setLoadingLyrics(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai_router', {
        body: { mode: 'song', user_profile: profile, dialogue },
      });
      if (error) throw error;
      setLyrics((data as { lyrics?: string })?.lyrics || '');
      setPrompt((data as { prompt?: string })?.prompt || '');
    } catch (err) {
      console.error('Failed to generate lyrics', err);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const generateSong = async () => {
    if (!user) return;
    setGeneratingSong(true);
    try {
      await supabase.from('song_dialogues').insert({
        user_id: user.id,
        input: { dialogue, lyrics, prompt },
      });

      const apiKey = localStorage.getItem('sunoApiKey');
      if (apiKey) sunoApi.setApiKey(apiKey);

      const { task_id } = await sunoApi.generateSong({
        prompt: lyrics,
        style: prompt,
        title: 'My Song',
        customMode: true,
        instrumental: false,
        model: 'V4',
      });

      await supabase.from('songs').update({ lyrics, prompt }).eq('task_id', task_id);

      webhookService.registerTask(task_id);
      webhookService.markTaskAsProcessing(task_id);
      await sunoApi.waitForWebhookCompletion(task_id);
    } catch (err) {
      console.error('Song generation failed', err);
    } finally {
      setGeneratingSong(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Textarea
        placeholder="Describe your situation..."
        value={dialogue}
        onChange={(e) => setDialogue(e.target.value)}
      />
      <Button onClick={fetchLyrics} disabled={loadingLyrics}>
        {loadingLyrics ? 'Generating...' : 'Generate Lyrics'}
      </Button>
      {lyrics && (
        <div className="space-y-4">
          <Textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={8}
          />
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Suno prompt"
          />
          <Button onClick={generateSong} disabled={generatingSong}>
            {generatingSong ? 'Submitting...' : 'Generate Song'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default function SongDialoguePage() {
  return (
    <AppProvider>
      <SongDialogueInner />
    </AppProvider>
  );
}

