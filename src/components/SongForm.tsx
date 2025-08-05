import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Music } from 'lucide-react';
import { SongFormFields } from '@/components/SongFormFields';
import { SongFormActions } from '@/components/SongFormActions';

export interface SongFormData {
  mood: string;
  energyLevel: string;
  genre: string;
  situation: string;
  tags: string[];
  customMode: boolean;
  instrumental: boolean;
  model: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS';
  style: string;
  title: string;
  negativeTags: string;
}

export const SongForm: React.FC = () => {
  const [formData, setFormData] = useState<SongFormData>({
    mood: '', energyLevel: '', genre: '', situation: '', tags: [],
    customMode: true, instrumental: false, model: 'V4',
    style: '', title: '', negativeTags: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [musicStyle, setMusicStyle] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const { user } = useAppContext();

  const checkSunoApiKey = () => true;
  const setShowApiHelp = () => {};

  const getCharacterLimits = () => {
    const isV4_5Plus = formData.model === 'V4_5' || formData.model === 'V4_5PLUS';
    return {
      prompt: formData.customMode ? (isV4_5Plus ? 5000 : 3000) : 400,
      style: isV4_5Plus ? 1000 : 200,
      title: 80
    };
  };

  const validateForm = (): string | null => {
    const limits = getCharacterLimits();
    
    if (!musicStyle.trim()) {
      return 'Custom mode requires style';
    }
    if (!formData.title.trim()) {
      return 'Custom mode requires title';
    }
    if (!formData.instrumental && !generatedLyrics.trim()) {
      return 'Non-instrumental mode requires lyrics';
    }
    if (musicStyle.length > limits.style) {
      return `Style exceeds ${limits.style} character limit`;
    }
    if (formData.title.length > limits.title) {
      return `Title exceeds ${limits.title} character limit`;
    }
    if (generatedLyrics.length > limits.prompt) {
      return `Lyrics exceed ${limits.prompt} character limit`;
    }
    
    return null;
  };

  const resetForm = () => {
    setFormData({
      mood: '', energyLevel: '', genre: '', situation: '', tags: [],
      customMode: true, instrumental: false, model: 'V4',
      style: '', title: '', negativeTags: ''
    });
    setGeneratedLyrics('');
    setMusicStyle('');
    setCurrentTaskId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <Card className="flex-1 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />Create Your Personalized Song
            </CardTitle>
            <CardDescription>
              Fill out the form below to generate a song tailored to your mood and goals.
              {user?.plan === 'free' && (
                <span className="block mt-1 text-sm text-orange-600">
                  Free plan: {3 - user.songsToday} songs remaining today
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SongFormFields
              formData={formData}
              setFormData={setFormData}
              generatedLyrics={generatedLyrics}
              setGeneratedLyrics={setGeneratedLyrics}
              musicStyle={musicStyle}
              setMusicStyle={setMusicStyle}
              autoSave={autoSave}
              setAutoSave={setAutoSave}
              getCharacterLimits={getCharacterLimits}
            />
            
            <SongFormActions
              formData={formData}
              loading={loading}
              generatingAudio={generatingAudio}
              generatedLyrics={generatedLyrics}
              musicStyle={musicStyle}
              autoSave={autoSave}
              setLoading={setLoading}
              setGeneratingAudio={setGeneratingAudio}
              setGeneratedLyrics={setGeneratedLyrics}
              setMusicStyle={setMusicStyle}
              setShowApiHelp={setShowApiHelp}
              resetForm={resetForm}
              validateForm={validateForm}
              checkSunoApiKey={checkSunoApiKey}
              setCurrentTaskId={setCurrentTaskId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};