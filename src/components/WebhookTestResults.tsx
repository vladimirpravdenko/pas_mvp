import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WebhookStatusIndicator } from './WebhookStatusIndicator';
import { RefreshCw, Download, Play, Pause } from 'lucide-react';

interface WebhookSong {
  id: string;
  title: string;
  audio_url: string;
  status: string;
  prompt: string;
  receivedAt: string;
  webhookProcessed: boolean;
}

export const WebhookTestResults: React.FC = () => {
  const [songs, setSongs] = useState<WebhookSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  const fetchWebhookData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/webhook-data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const webhookSongs = Array.isArray(result.data) ? result.data : [];
      setSongs(webhookSongs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch webhook data');
    } finally {
      setLoading(false);
    }
  };

  const downloadSong = async (song: WebhookSong) => {
    try {
      if (!song.audio_url) {
        throw new Error('No audio URL available');
      }
      
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(song.audio_url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title || 'song'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const togglePlayback = async (song: WebhookSong) => {
    if (!song.audio_url) return;
    
    const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(song.audio_url)}`;
    
    if (playingId === song.id) {
      // Stop current playback
      const audio = audioElements.get(song.id);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      audioElements.forEach((audio, id) => {
        if (id !== song.id) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      // Start new playback
      let audio = audioElements.get(song.id);
      if (!audio) {
        audio = new Audio(proxyUrl);
        audio.addEventListener('ended', () => setPlayingId(null));
        audio.addEventListener('error', () => {
          console.error('Audio playback error for song:', song.id);
          setPlayingId(null);
        });
        setAudioElements(prev => new Map(prev).set(song.id, audio!));
      }
      
      try {
        await audio.play();
        setPlayingId(song.id);
      } catch (err) {
        console.error('Playback error:', err);
        setPlayingId(null);
      }
    }
  };

  useEffect(() => {
    fetchWebhookData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchWebhookData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cleanup audio elements on unmount
    return () => {
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const getStatusFromSong = (song: WebhookSong): 'waiting' | 'processing' | 'completed' | 'failed' | 'unknown' => {
    const status = song.status?.toLowerCase();
    if (['complete', 'completed', 'success', 'finished'].includes(status)) {
      return 'completed';
    }
    if (['failed', 'error', 'cancelled'].includes(status)) {
      return 'failed';
    }
    if (['processing', 'generating', 'pending'].includes(status)) {
      return 'processing';
    }
    if (['waiting', 'queued'].includes(status)) {
      return 'waiting';
    }
    return 'unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Webhook Test Results</span>
          <Button 
            onClick={fetchWebhookData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {songs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading webhook data...' : 'No webhook data received yet. Send a test webhook to see results here.'}
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <div key={song.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium">{song.title || 'Untitled Song'}</h3>
                    <p className="text-sm text-gray-600 mt-1">{song.prompt}</p>
                  </div>
                  <WebhookStatusIndicator 
                    status={getStatusFromSong(song)}
                    compact
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <p>ID: {song.id}</p>
                    <p>Received: {new Date(song.receivedAt).toLocaleString()}</p>
                    <p>Audio: {song.audio_url ? 'Available' : 'Not available'}</p>
                  </div>
                  
                  {song.audio_url && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => togglePlayback(song)}
                        variant="outline"
                        size="sm"
                      >
                        {playingId === song.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => downloadSong(song)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};