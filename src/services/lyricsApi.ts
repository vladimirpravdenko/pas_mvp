// Lyrics generation service using OpenAI or Ollama

interface LyricsRequest {
  mood: string;
  energyLevel: string;
  genre: string;
  situation?: string;
  tags?: string[];
}

interface LyricsResponse {
  lyrics: string;
  audioPrompt: string;
}

class LyricsApiService {
  async generateLyrics(request: LyricsRequest): Promise<LyricsResponse> {
    // Try OpenAI first
    const openaiKey = localStorage.getItem('openaiApiKey');
    if (openaiKey) {
      try {
        return await this.generateWithOpenAI(request, openaiKey);
      } catch (error) {
        console.warn('OpenAI failed, trying Ollama:', error);
      }
    }

    // Try Ollama
    const ollamaUrl = localStorage.getItem('ollamaUrl') || 'http://localhost:11434';
    try {
      return await this.generateWithOllama(request, ollamaUrl);
    } catch (error) {
      console.warn('Ollama failed, using fallback:', error);
    }

    // Fallback to mock generation
    return this.generateMockLyrics(request);
  }

  private async generateWithOpenAI(request: LyricsRequest, apiKey: string): Promise<LyricsResponse> {
    const prompt = this.createLyricsPrompt(request);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    return this.parseLyricsResponse(content, request);
  }

  private async generateWithOllama(request: LyricsRequest, baseUrl: string): Promise<LyricsResponse> {
    const prompt = this.createLyricsPrompt(request);
    
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseLyricsResponse(data.response, request);
  }

  private createLyricsPrompt(request: LyricsRequest): string {
    const situationText = request.situation ? `\nCurrent situation: ${request.situation}` : '';
    const tagsText = request.tags?.length ? `\nTags: ${request.tags.join(', ')}` : '';
    
    return `Create song lyrics for a ${request.genre} song with the following specifications:
- Mood/Goal: ${request.mood}
- Energy Level: ${request.energyLevel}${situationText}${tagsText}

Please provide:
1. Complete song lyrics with verse, chorus, and bridge structure
2. A brief audio prompt describing the musical style and instrumentation

Format your response as:
LYRICS:
[lyrics here]

AUDIO_PROMPT:
[audio prompt here]`;
  }

  private parseLyricsResponse(content: string, request: LyricsRequest): LyricsResponse {
    const lyricsMatch = content.match(/LYRICS:\s*([\s\S]*?)(?=AUDIO_PROMPT:|$)/i);
    const promptMatch = content.match(/AUDIO_PROMPT:\s*([\s\S]*?)$/i);
    
    const lyrics = lyricsMatch?.[1]?.trim() || this.generateMockLyrics(request).lyrics;
    const audioPrompt = promptMatch?.[1]?.trim() || this.generateMockAudioPrompt(request);
    
    return { lyrics, audioPrompt };
  }

  private generateMockLyrics(request: LyricsRequest): LyricsResponse {
    const lyrics = `[Verse 1]
Rising up with ${request.mood} in my heart
Every step I take, a brand new start
With ${request.energyLevel} energy flowing through
I can conquer anything, dreams coming true

[Chorus]
I am strong, I am brave, I am free
This ${request.genre} beat is lifting me
No more doubt, no more fear
My ${request.mood} is crystal clear

[Verse 2]
Every challenge that comes my way
I'll face it with courage, day by day
The rhythm guides me, the melody soars
I'm breaking through all the limiting doors

[Chorus]
I am strong, I am brave, I am free
This ${request.genre} beat is lifting me
No more doubt, no more fear
My ${request.mood} is crystal clear

[Bridge]
In this moment, I choose to shine
Every dream and goal is mine
With this song, I claim my power
This is my defining hour`;
    
    const audioPrompt = this.generateMockAudioPrompt(request);
    
    return { lyrics, audioPrompt };
  }

  private generateMockAudioPrompt(request: LyricsRequest): string {
    return `Create a ${request.genre} song with ${request.energyLevel} energy, focusing on ${request.mood}. ${request.tags?.length ? `Include elements: ${request.tags.join(', ')}.` : ''} The song should be uplifting and motivational with modern production.`;
  }
}

export const lyricsApi = new LyricsApiService();
export type { LyricsRequest, LyricsResponse };