import React from 'react';
import type { SongFormData } from './SongForm';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Music, Sparkles, Loader2 } from 'lucide-react';
import { lyricsApi } from '@/services/lyricsApi';
import { sunoApi } from '@/services/sunoApi';
import { webhookService } from '@/services/webhookService';
import { useAppContext } from '@/contexts/AppContext';

interface SongFormActionsProps {
  formData: SongFormData;
  loading: boolean;
  generatingAudio: boolean;
  generatedLyrics: string;
  musicStyle: string;
  autoSave: boolean;
  setLoading: (loading: boolean) => void;
  setGeneratingAudio: (generating: boolean) => void;
  setGeneratedLyrics: (lyrics: string) => void;
  setMusicStyle: (style: string) => void;
  setShowApiHelp: (show: boolean) => void;
  resetForm: () => void;
  validateForm: () => string | null;
  checkSunoApiKey: () => boolean;
  setCurrentTaskId: (taskId: string | null) => void;
}

export const SongFormActions: React.FC<SongFormActionsProps> = ({
  formData, loading, generatingAudio, generatedLyrics, musicStyle, autoSave,
  setLoading, setGeneratingAudio, setGeneratedLyrics, setMusicStyle,
  setShowApiHelp, resetForm, validateForm, checkSunoApiKey, setCurrentTaskId
}) => {
  const { addSong, canGenerateSong } = useAppContext();

  const generateLyrics = async () => {
    if (!canGenerateSong()) {
      toast({ title: 'Limit Reached', description: 'Free users can generate 3 songs per day. Upgrade to unlimited!', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await lyricsApi.generateLyrics({
        mood: formData.mood, energyLevel: formData.energyLevel, genre: formData.genre, situation: formData.situation, tags: formData.tags
      });
      setGeneratedLyrics(response.lyrics);
      setMusicStyle(response.audioPrompt || `${formData.genre} with ${formData.mood} mood`);
      toast({ title: 'Lyrics Generated!', description: 'Edit lyrics and music style as needed, then click Generate Audio.' });
    } catch (error) {
      console.error('Lyrics generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate lyrics. Please check your API configuration.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateAudio = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError, variant: 'destructive' });
      return;
    }
    
    if (!checkSunoApiKey()) {
      toast({ title: 'Suno API Key Missing', description: 'Please configure your Suno API key in the Settings tab before generating audio.', variant: 'destructive' });
      setShowApiHelp(true);
      return;
    }
    
    setGeneratingAudio(true);
    
    try {
      // Configure API key
      const sunoApiKey = localStorage.getItem('sunoApiKey');
      if (sunoApiKey) {
        sunoApi.setApiKey(sunoApiKey);
      }
      
      const requestBody = {
        prompt: generatedLyrics,
        style: musicStyle,
        title: formData.title,
        customMode: true,
        instrumental: formData.instrumental,
        model: formData.model as 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS',
        negativeTags: formData.negativeTags || undefined
      };

      console.log('Sending request to Suno API:', requestBody);
      const result = await sunoApi.generateSong(requestBody);
      
      if (!result.task_id) {
        throw new Error('No task ID received from Suno API');
      }

      // Register task with webhook service and set current task ID
      webhookService.registerTask(result.task_id);
      setCurrentTaskId(result.task_id);
      
      toast({ 
        title: 'Processing Audio', 
        description: 'Waiting for webhook completion. MP3 files will be automatically downloaded.' 
      });
      
      // Mark as processing when webhook waiting starts
      webhookService.markTaskAsProcessing(result.task_id);
      
      // Use webhook-based completion instead of polling
      const completedSongs = await sunoApi.waitForWebhookCompletion(result.task_id);
      
      if (completedSongs.length === 0) {
        webhookService.markTaskAsFailed(result.task_id, 'No completed songs received');
        throw new Error('No completed songs received');
      }
      
      // Mark as completed
      webhookService.markTaskAsCompleted(result.task_id, completedSongs.length);
      
      // Process all completed songs
      for (const completedSong of completedSongs) {
        const newSong = {
          id: completedSong.id,
          title: completedSong.title || formData.title || `${formData.mood.charAt(0).toUpperCase() + formData.mood.slice(1)} Song`,
          lyrics: generatedLyrics,
          audioUrl: completedSong.audio_url,
          mood: formData.mood,
          genre: formData.genre,
          createdAt: new Date().toISOString(),
          tags: formData.tags?.join(', ') || '',
          prompt: generatedLyrics
        };
        
        addSong(newSong);
      }
      
      const songCount = completedSongs.length;
      const message = songCount > 1 
        ? `${songCount} personalized songs generated and downloaded!`
        : 'Personalized song generated and downloaded!';
      
      toast({ 
        title: 'Songs Created!', 
        description: message
      });
      
      resetForm();
      setShowApiHelp(false);
      
    } catch (error) {
      console.error('Audio generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Mark task as failed if we have a task ID
      const taskId = currentTaskId;
      if (taskId) {
        webhookService.markTaskAsFailed(taskId, errorMessage);
      }
      
      if (errorMessage.includes('404') || errorMessage.includes('401') || errorMessage.includes('Bearer')) {
        setShowApiHelp(true);
      }
      
      toast({
        title: 'Audio Generation Failed',
        description: errorMessage.includes('not configured') 
          ? 'Suno API key is not configured. Please add your API key in Settings.'
          : `Error: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setGeneratingAudio(false);
      setCurrentTaskId(null);
    }
  };

  const canGenerate = formData.mood && formData.energyLevel && formData.genre;
  const hasSunoKey = checkSunoApiKey();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={generateLyrics} disabled={!canGenerate || loading} className="flex-1">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {loading ? 'Generating...' : 'Generate Lyrics'}
        </Button>
        {generatedLyrics && (
          <Button onClick={generateAudio} disabled={generatingAudio || !hasSunoKey} variant="secondary" className="flex-1">
            {generatingAudio ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Music className="h-4 w-4 mr-2" />}
            {generatingAudio ? 'Creating Audio...' : 'Generate Audio'}
          </Button>
        )}
      </div>
    </div>
  );
};