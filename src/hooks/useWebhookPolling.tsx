import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';
import { audioStorage } from '@/services/audioStorage';
import { useToast } from '@/hooks/use-toast';

export const useWebhookPolling = () => {
  const { addSong } = useAppContext();
  const { toast } = useToast();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const pollForNewSongs = async () => {
    try {
      const { data: songs, error } = await supabase
        .from('songs')
        .select('*')
        .eq('status', 'complete')
        .not('audio_url', 'is', null)
        .not('task_id', 'is', null)
        .order('webhook_received_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error polling for songs:', error);
        return;
      }

      if (songs && songs.length > 0) {
        for (const song of songs) {
          try {
            if (song.audio_url) {
              await audioStorage.downloadAndStore(song.audio_url, {
                id: song.suno_id || song.id,
                title: song.title,
                prompt: song.prompt,
                tags: song.tags
              });
            }

            addSong({
              id: song.suno_id || song.id,
              title: song.title,
              audioUrl: song.audio_url,
              prompt: song.prompt,
              status: song.status,
              createdAt: song.created_at,
              tags: song.tags,
              lyrics: song.lyric,
              taskId: song.task_id
            });

            toast({
              title: 'Song Ready!',
              description: `${song.title} is ready to play.`
            });
          } catch (error) {
            console.error('Error processing song:', error);
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    pollForNewSongs();
    pollingRef.current = setInterval(pollForNewSongs, 10000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  return { startPolling, stopPolling };
};