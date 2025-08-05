import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Song } from '@/types/song';

type SortOption = 'created_at_desc' | 'created_at_asc' | 'mood' | 'style';

interface FilterSortControlsProps {
  songs: Song[];
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  moodFilter: string;
  setMoodFilter: (mood: string) => void;
  styleFilter: string;
  setStyleFilter: (style: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const SongFilterSortControls: React.FC<FilterSortControlsProps> = ({
  songs,
  sortBy,
  setSortBy,
  moodFilter,
  setMoodFilter,
  styleFilter,
  setStyleFilter,
  searchQuery = '',
  setSearchQuery
}) => {
  const uniqueMoods = Array.from(new Set(songs.map(s => s.mood).filter(Boolean)));
  const uniqueStyles = Array.from(new Set(songs.map(s => s.style).filter(Boolean)));

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      {setSearchQuery && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 px-2 py-1 border border-input rounded-md"
            placeholder="Title"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Sort by:</label>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Newest First</SelectItem>
            <SelectItem value="created_at_asc">Oldest First</SelectItem>
            <SelectItem value="mood">Mood</SelectItem>
            <SelectItem value="style">Style</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {uniqueMoods.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Mood:</label>
          <Select value={moodFilter} onValueChange={setMoodFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {uniqueMoods.map(mood => (
                <SelectItem key={mood} value={mood}>{mood}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {uniqueStyles.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Style:</label>
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {uniqueStyles.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(moodFilter || styleFilter) && (
        <div className="flex items-center gap-2">
          {moodFilter && (
            <Badge variant="secondary" className="gap-1">
              {moodFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setMoodFilter('')} />
            </Badge>
          )}
          {styleFilter && (
            <Badge variant="secondary" className="gap-1">
              {styleFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStyleFilter('')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};