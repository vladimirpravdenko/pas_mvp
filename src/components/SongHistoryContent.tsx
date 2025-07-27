import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Play, Pause, Calendar, Download, ExternalLink, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { Song } from '@/types/song';
import { StoredAudio } from '@/services/audioStorage';

interface SongHistoryContentProps {
  sortedSongs: Song[];
  playingId: string | null;
  storedAudios: StoredAudio[];
  downloadingIds: Set<string>;
  getAudioUrl: (song: Song) => string | null;
  isAudioStored: (song: Song) => boolean;
  toggleAudio: (song: Song) => void;
  saveAudioLocally: (song: Song) => void;
  downloadAudio: (song: Song) => void;
  formatDate: (dateString: string) => string;
}

export const SongHistoryContent: React.FC<SongHistoryContentProps> = ({
  sortedSongs,
  playingId,
  storedAudios,
  downloadingIds,
  getAudioUrl,
  isAudioStored,
  toggleAudio,
  saveAudioLocally,
  downloadAudio,
  formatDate
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const cleanTitle = (title?: string): string => {
    if (!title) return 'Untitled Song';
    let cleaned = title.replace(/\[taskId:\s*[^\]]+\]/gi, '').trim();
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '').trim();
    return cleaned || 'Untitled Song';
  };

  const toggleExpanded = (songId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      {sortedSongs.map((song) => {
        const songId = song.id || song.suno_id || '';
        const isPlaying = playingId === songId;
        const audioUrl = getAudioUrl(song);
        const stored = isAudioStored(song);
        const downloading = downloadingIds.has(songId);
        const isComplete = audioUrl && song.audio_url;
        const isExpanded = expandedCards.has(songId);
        
        return (
          <Collapsible key={songId} open={isExpanded} onOpenChange={() => toggleExpanded(songId)}>
            <Card className={`border-l-4 transition-all duration-200 ${
              stored ? 'border-l-green-500' : 
              isComplete ? 'border-l-purple-500' : 
              'border-l-yellow-500'
            }`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {cleanTitle(song.title)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(song.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isComplete && (
                        <Badge variant="secondary" className="text-xs">
                          pending
                        </Badge>
                      )}
                      {stored && (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          stored
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {song.mood && (
                        <Badge variant="outline" className="capitalize">
                          {song.mood}
                        </Badge>
                      )}
                      {song.style && (
                        <Badge variant="outline" className="capitalize">
                          {song.style}
                        </Badge>
                      )}
                    </div>
                    
                    {isComplete && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {!stored && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveAudioLocally(song);
                            }}
                            disabled={downloading}
                            title="Save for offline playback"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadAudio(song);
                          }}
                          disabled={downloading}
                          title="Download MP3"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(audioUrl, '_blank');
                          }}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudio(song);
                          }}
                        >
                          {isPlaying ? (
                            <><Pause className="h-4 w-4 mr-1" />Pause</>
                          ) : (
                            <><Play className="h-4 w-4 mr-1" />Play</>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {song.lyric && isComplete && (
                      <div className="bg-gray-50 p-3 rounded border">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                          {song.lyric}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};