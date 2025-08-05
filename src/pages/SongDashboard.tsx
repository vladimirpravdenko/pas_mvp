import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AudioPlayer from '@/components/AudioPlayer';
import { supabase } from '@/lib/supabaseClient';
import { Song } from '@/types/song';
import { SongFilterSortControls } from '@/components/SongFilterSortControls';

type SortOption = 'created_at_desc' | 'created_at_asc' | 'mood' | 'style';

export default function SongDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('created_at_desc');
  const [moodFilter, setMoodFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('status', 'complete')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSongs(data);
      }
    };

    fetchSongs();
  }, []);

  const filteredSongs = songs.filter((song) => {
    if (moodFilter && song.mood !== moodFilter) return false;
    if (styleFilter && song.style !== styleFilter) return false;
    if (
      searchQuery &&
      !(song.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case 'created_at_desc':
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'created_at_asc':
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'mood':
        return (a.mood || '').localeCompare(b.mood || '');
      case 'style':
        return (a.style || '').localeCompare(b.style || '');
      default:
        return 0;
    }
  });

  return (
    <div className="p-4 space-y-4">
      <SongFilterSortControls
        songs={songs}
        sortBy={sortBy}
        setSortBy={setSortBy}
        moodFilter={moodFilter}
        setMoodFilter={setMoodFilter}
        styleFilter={styleFilter}
        setStyleFilter={setStyleFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {sortedSongs.map((song) => (
        <Card key={song.id}>
          <CardHeader>
            <CardTitle>{song.title || 'Untitled'}</CardTitle>
            <CardDescription>
              {new Date(song.created_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {song.audio_url && <AudioPlayer src={song.audio_url} />}
          </CardContent>
        </Card>
      ))}

      {sortedSongs.length === 0 && (
        <p className="text-sm text-muted-foreground">No songs found.</p>
      )}
    </div>
  );
}

