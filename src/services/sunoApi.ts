import { audioStorage } from './audioStorage';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface SunoGenerateRequest {
  prompt: string;
  style?: string;
  title?: string;
  customMode: boolean;
  instrumental: boolean;
  model: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS';
  negativeTags?: string;
}

interface SunoSong {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model_name: string;
  status: string;
  gpt_description_prompt: string;
  prompt: string;
  type: string;
  tags: string;
}

class SunoApiService {
  private baseUrl = 'https://api.sunoapi.org';
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private getCallbackUrl(): string {
    // Production Supabase webhook endpoint
    return 'https://abhhiplxeaawdnxnjovf.supabase.co/functions/v1/suno-webhook';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error('API key not set. Please configure your Suno API key.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  async generateSong(request: SunoGenerateRequest): Promise<{ task_id: string; songs: SunoSong[] }> {
    const taskId = uuidv4();
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User must be authenticated to generate songs');
    }
    
    const body: Record<string, unknown> = {
      prompt: request.prompt,
      style: request.style || '',
      title: request.title ? `${request.title} [taskId: ${taskId}]` : `[taskId: ${taskId}]`,
      customMode: request.customMode,
      instrumental: request.instrumental,
      model: request.model,
      callBackUrl: this.getCallbackUrl(),
      metadata: { taskId }
    };

    if (request.negativeTags) {
      body.negativeTags = request.negativeTags;
    }

    // Store initial record in songs table with task_id and user_id
    await supabase
      .from('songs')
      .insert({
        task_id: taskId,
        title: request.title || 'Untitled',
        prompt: request.prompt,
        status: 'pending',
        user_id: session.user.id,
        created_at: new Date().toISOString()
      });

    // Store task mapping with user_id for RLS
    await supabase
      .from('task_mapping')
      .insert({
        task_id: taskId,
        title: request.title || 'Untitled',
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    const response = await this.makeRequest('/api/v1/generate', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    if (response.code !== 200) {
      throw new Error(`API Error ${response.code}: ${response.msg}`);
    }
    
    return {
      task_id: taskId,
      songs: response.data?.songs || response.songs || []
    };
  }

  async waitForWebhookCompletion(taskId: string, maxAttempts = 60): Promise<SunoSong[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: songs } = await supabase
        .from('songs')
        .select('*')
        .eq('task_id', taskId)
        .eq('status', 'complete');
      
      if (songs && songs.length > 0) {
        for (const song of songs) {
          if (song.audio_url) {
            try {
              await audioStorage.downloadAndStore(song.audio_url, song);
            } catch (error) {
              console.error(`Failed to download song ${song.title}:`, error);
            }
          }
        }
        
        return songs.map((song) => ({
          id: song.suno_id || song.id,
          title: song.title || 'Untitled',
          image_url: song.image_url || '',
          lyric: song.lyric || '',
          audio_url: song.audio_url || '',
          video_url: song.video_url || '',
          created_at: song.created_at,
          model_name: song.model_name || '',
          status: song.status,
          gpt_description_prompt: song.gpt_description_prompt || '',
          prompt: song.prompt || '',
          type: song.type || 'generated',
          tags: song.tags || ''
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error('Song generation timed out waiting for webhook');
  }

  async downloadSong(audioUrl: string, filename: string): Promise<void> {
    const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'song.mp3';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const sunoApi = new SunoApiService();
export type { SunoGenerateRequest, SunoSong };