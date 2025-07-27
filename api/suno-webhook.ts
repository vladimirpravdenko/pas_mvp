import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setWebhookData } from './webhook-data';

interface SunoWebhookPayload {
  data: Array<{
    id: string;
    title: string;
    audio_url: string;
    prompt: string;
    status: string;
    image_url?: string;
    lyric?: string;
    video_url?: string;
    created_at?: string;
    model_name?: string;
    gpt_description_prompt?: string;
    type?: string;
    tags?: string;
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set JSON headers immediately
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    const payload: SunoWebhookPayload = req.body;

    if (!payload?.data || !Array.isArray(payload.data)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const processed = [];
    for (const song of payload.data) {
      if (song.id) {
        setWebhookData(song.id, {
          ...song,
          receivedAt: new Date().toISOString(),
          isComplete: song.status === 'complete'
        });
        processed.push({ id: song.id, title: song.title, status: song.status });
      }
    }

    return res.status(200).json({ 
      success: true,
      processed: processed.length,
      songs: processed
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Processing failed'
    });
  }
}