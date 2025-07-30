import React from 'react';
import type { SongFormData } from './SongForm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface SongFormFieldsProps {
  formData: SongFormData;
  setFormData: React.Dispatch<React.SetStateAction<SongFormData>>;
  generatedLyrics: string;
  setGeneratedLyrics: (lyrics: string) => void;
  musicStyle: string;
  setMusicStyle: (style: string) => void;
  autoSave: boolean;
  setAutoSave: (save: boolean) => void;
  getCharacterLimits: () => { prompt: number; style: number; title: number };
}

const MOODS = ['confidence', 'relaxation', 'focus', 'motivation', 'happiness', 'calm'];
const ENERGY_LEVELS = ['low', 'moderate', 'high'];
const GENRES = ['pop', 'rock', 'ambient', 'electronic', 'acoustic', 'hip-hop'];
const TAGS = ['instrumental', 'uplifting', 'energetic', 'peaceful', 'inspiring', 'powerful'];

export const SongFormFields: React.FC<SongFormFieldsProps> = ({
  formData, setFormData, generatedLyrics, setGeneratedLyrics, musicStyle, setMusicStyle,
  autoSave, setAutoSave, getCharacterLimits
}) => {
  const handleTagChange = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tags: checked ? [...prev.tags, tag] : prev.tags.filter(t => t !== tag)
    }));
  };

  const limits = getCharacterLimits();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Mood/Goal</Label>
          <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
            <SelectTrigger><SelectValue placeholder="Select mood" /></SelectTrigger>
            <SelectContent>
              {MOODS.map(mood => (<SelectItem key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Energy Level</Label>
          <Select value={formData.energyLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, energyLevel: value }))}>
            <SelectTrigger><SelectValue placeholder="Select energy" /></SelectTrigger>
            <SelectContent>
              {ENERGY_LEVELS.map(level => (<SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Genre</Label>
          <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
            <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
            <SelectContent>
              {GENRES.map(genre => (<SelectItem key={genre} value={genre}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Current Situation (Optional)</Label>
        <Textarea value={formData.situation} onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))} placeholder="Describe your current situation..." className="min-h-[80px]" />
      </div>
      
      <div className="space-y-2">
        <Label>Tags (Optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TAGS.map(tag => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={tag} checked={formData.tags.includes(tag)} onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)} />
              <Label htmlFor={tag} className="text-sm">{tag.charAt(0).toUpperCase() + tag.slice(1)}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="instrumental" checked={formData.instrumental} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, instrumental: checked as boolean }))} />
          <Label htmlFor="instrumental" className="text-sm">Instrumental (No Lyrics)</Label>
        </div>
        
        <div className="space-y-2">
          <Label>Title ({formData.title.length}/{limits.title})</Label>
          <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Song title" maxLength={limits.title} />
        </div>
        
        <div className="space-y-2">
          <Label>Negative Tags (Optional)</Label>
          <Input value={formData.negativeTags} onChange={(e) => setFormData(prev => ({ ...prev, negativeTags: e.target.value }))} placeholder="e.g., Heavy Metal, Upbeat Drums" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="autoSave" checked={autoSave} onCheckedChange={(checked) => setAutoSave(checked as boolean)} />
        <Label htmlFor="autoSave" className="text-sm">Auto-save audio for offline playback</Label>
      </div>
      
      {generatedLyrics && (
        <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
          <div>
            <Label className="text-sm font-semibold">Generated Lyrics (Editable) ({generatedLyrics.length}/{limits.prompt}):</Label>
            <Textarea value={generatedLyrics} onChange={(e) => setGeneratedLyrics(e.target.value)} className="mt-2 min-h-[200px] font-mono text-sm" placeholder="Generated lyrics will appear here..." maxLength={limits.prompt} />
          </div>
          <div>
            <Label className="text-sm font-semibold">Music Style (Editable) ({musicStyle.length}/{limits.style}):</Label>
            <Input value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)} className="mt-2" placeholder="e.g., Jazz, Classical, Electronic" maxLength={limits.style} />
          </div>
        </div>
      )}
    </div>
  );
};