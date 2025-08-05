import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';
import type { UserInitialProfile } from '@/types/userInitialProfile';

interface Props {
  initialProfile: UserInitialProfile;
}

const InitialDialogueForm: React.FC<Props> = ({ initialProfile }) => {
  const { user, refreshInitialDialogueResponses } = useAppContext();
  const [profile, setProfile] = useState<UserInitialProfile>(initialProfile);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleChange = (field: keyof UserInitialProfile, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(Boolean);
    setProfile(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('user_initial_dialogue_responses').upsert(
        {
          user_id: user.id,
          responses: profile,
        },
        { onConflict: 'user_id' }
      );
      await refreshInitialDialogueResponses();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to save initial dialogue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'initial_profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Review your profile before generating songs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emotional_keywords">Emotional Keywords</Label>
              <Input
                id="emotional_keywords"
                value={profile.emotional_keywords.join(', ')}
                onChange={(e) => handleChange('emotional_keywords', e.target.value)}
                placeholder="e.g., hopeful, calm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotional_valence">Emotional Valence</Label>
              <Input
                id="emotional_valence"
                value={profile.emotional_valence.join(', ')}
                onChange={(e) => handleChange('emotional_valence', e.target.value)}
                placeholder="e.g., positive, negative"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="core_images_or_concepts">Core Images or Concepts</Label>
              <Input
                id="core_images_or_concepts"
                value={profile.core_images_or_concepts.join(', ')}
                onChange={(e) => handleChange('core_images_or_concepts', e.target.value)}
                placeholder="e.g., mountains, ocean"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_music_styles">Preferred Music Styles</Label>
              <Input
                id="preferred_music_styles"
                value={profile.preferred_music_styles.join(', ')}
                onChange={(e) => handleChange('preferred_music_styles', e.target.value)}
                placeholder="e.g., jazz, pop"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorite_artists">Favorite Artists</Label>
              <Input
                id="favorite_artists"
                value={profile.favorite_artists.join(', ')}
                onChange={(e) => handleChange('favorite_artists', e.target.value)}
                placeholder="e.g., Artist A, Artist B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorite_songs">Favorite Songs</Label>
              <Input
                id="favorite_songs"
                value={profile.favorite_songs.join(', ')}
                onChange={(e) => handleChange('favorite_songs', e.target.value)}
                placeholder="e.g., Song A, Song B"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleExport}>
              Export as JSON
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialDialogueForm;
