import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Music } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { audioStorage, StoredAudio } from '@/services/audioStorage';
import { sunoApi } from '@/services/sunoApi';
import { supabase } from '@/lib/supabase';
import { Song } from '@/types/song';
import { SongFilterSortControls } from './SongFilterSortControls';
import { SongHistoryContent } from './SongHistoryContent';

type SortOption = 'created_at_desc' | 'created_at_asc' | 'mood' | 'style';

export const SongHistory: React.FC = () => {
  const { songs: contextSongs, user } = useAppContext();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('created_at_desc');
  const [moodFilter, setMoodFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [storedAudios, setStoredAudios] = useState<StoredAudio[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStoredAudios();
    loadSongsFromSupabase();
  }, [user]);

  const loadSongsFromSupabase = async () => {
    if (!user?.id) {
      setAllSongs([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllSongs(data || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
      const userContextSongs = contextSongs.filter(song => {
        const withUser = song as Song & { user_id?: string };
        return withUser.id && withUser.user_id === user.id;
      }) as Song[];
      setAllSongs(userContextSongs);
    }
  };

  // Show all songs for the user, including pending ones
  const userSongs = allSongs.filter(song => 
    song.user_id === user?.id
  );

  const filteredSongs = userSongs.filter(song => {
    if (moodFilter && song.mood !== moodFilter) return false;
    if (styleFilter && song.style !== styleFilter) return false;
    return true;
  });

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case 'created_at_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'created_at_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'mood':
        return (a.mood || '').localeCompare(b.mood || '');
      case 'style':
        return (a.style || '').localeCompare(b.style || '');
      default:
        return 0;
    }
  });

  const loadStoredAudios = async () => {
    try {
      const stored = await audioStorage.getAllStoredAudio();
      setStoredAudios(stored);
    } catch (error) {
      console.error('Failed to load stored audios:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAudioUrl = (song: Song): string | null => {
    const stored = storedAudios.find(s => s.id === song.id || s.id === song.suno_id);
    if (stored) return stored.audioUrl;
    return song.audio_url || null;
  };

  const isAudioStored = (song: Song): boolean => {
    return storedAudios.some(s => s.id === song.id || s.id === song.suno_id);
  };

  const toggleAudio = async (song: Song) => {
    const audioUrl = getAudioUrl(song);
    if (!audioUrl) {
      toast({
        title: 'No Audio Available',
        description: 'This song does not have an audio file.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const songId = song.id || song.suno_id || '';
      let audio = audioElements.get(songId);
      
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => setPlayingId(null));
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          toast({
            title: 'Playback Error',
            description: 'Unable to play this audio file.',
            variant: 'destructive'
          });
          setPlayingId(null);
        });
        setAudioElements(prev => new Map(prev.set(songId, audio!)));
      }

      if (playingId === songId) {
        audio.pause();
        setPlayingId(null);
      } else {
        audioElements.forEach((audioEl, id) => {
          if (id !== songId && !audioEl.paused) {
            audioEl.pause();
          }
        });
        await audio.play();
        setPlayingId(songId);
      }
    } catch (error) {
      console.error('Audio control error:', error);
      toast({
        title: 'Playback Error',
        description: 'Unable to control audio playback.',
        variant: 'destructive'
      });
    }
  };

  const saveAudioLocally = async (song: Song) => {
    if (!song.audio_url) {
      toast({
        title: 'No Audio Available',
        description: 'This song does not have an audio file to save.',
        variant: 'destructive'
      });
      return;
    }

    const songId = song.id || song.suno_id || '';
    setDownloadingIds(prev => new Set(prev.add(songId)));

    try {
      const stored = await audioStorage.downloadAndStore(song.audio_url, song);
      setStoredAudios(prev => [...prev.filter(s => s.id !== songId), stored]);
      
      toast({
        title: 'Audio Saved',
        description: 'Song has been saved for offline playback.'
      });
    } catch (error) {
      console.error('Save audio error:', error);
      toast({
        title: 'Save Failed',
        description: 'Unable to save the audio file locally.',
        variant: 'destructive'
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  const downloadAudio = async (song: Song) => {
    const audioUrl = getAudioUrl(song);
    if (!audioUrl) {
      toast({
        title: 'No Audio Available',
        description: 'This song does not have an audio file to download.',
        variant: 'destructive'
      });
      return;
    }

    const songId = song.id || song.suno_id || '';
    setDownloadingIds(prev => new Set(prev.add(songId)));

    try {
      const filename = `${(song.title || 'song').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
          const response = await fetch(audioUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: 'Download Started',
        description: 'Your song download has begun.'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download the audio file.',
        variant: 'destructive'
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Your Song History
          </CardTitle>
          <CardDescription>
            Please log in to view your song history.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sortedSongs.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Your Song History
          </CardTitle>
          <CardDescription>
            Your generated songs will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No songs generated yet. Create your first personalized song!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Your Song History
        </CardTitle>
        <CardDescription>
          {sortedSongs.length} song{sortedSongs.length !== 1 ? 's' : ''} • {storedAudios.length} stored locally
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SongFilterSortControls
          songs={userSongs}
          sortBy={sortBy}
          setSortBy={setSortBy}
          moodFilter={moodFilter}
          setMoodFilter={setMoodFilter}
          styleFilter={styleFilter}
          setStyleFilter={setStyleFilter}
        />
        
        <SongHistoryContent
          sortedSongs={sortedSongs}
          playingId={playingId}
          storedAudios={storedAudios}
          downloadingIds={downloadingIds}
          getAudioUrl={getAudioUrl}
          isAudioStored={isAudioStored}
          toggleAudio={toggleAudio}
          saveAudioLocally={saveAudioLocally}
          downloadAudio={downloadAudio}
          formatDate={formatDate}
        />
      </CardContent>
    </Card>
  );
};