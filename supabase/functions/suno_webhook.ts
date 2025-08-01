// Edge function to receive Suno webhook events after a song generation task.
// Each webhook payload contains two audio URLs corresponding to two songs.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  audio_url_1: string;
  audio_url_2: string;
  image_url_1: string;
  image_url_2: string;
  title: string;
  task_id: string;
  tags?: string;
  lyric?: string;
  model_name?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const required = [
    'audio_url_1',
    'audio_url_2',
    'image_url_1',
    'image_url_2',
    'title',
    'task_id',
  ] as const;

  for (const key of required) {
    if (!payload[key]) {
      return new Response(
        JSON.stringify({ error: `Missing required field: ${key}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const updates = [1, 2].map(async (index) => {
    const audioUrl = payload[`audio_url_${index}` as const];
    const imageUrl = payload[`image_url_${index}` as const];
    const match = /\/([^/]+)\.mp3$/i.exec(audioUrl);
    if (!match) {
      throw new Error(`Invalid audio_url_${index}`);
    }
    const suno_id = match[1];

    const { error } = await supabase
      .from('songs')
      .update({
        audio_url: audioUrl,
        image_url: imageUrl,
        status: 'complete',
        title: payload.title,
        tags: payload.tags ?? null,
        lyric: payload.lyric ?? null,
        model_name: payload.model_name ?? null,
        task_id: payload.task_id,
        webhook_received_at: new Date().toISOString(),
      })
      .eq('suno_id', suno_id);

    if (error) throw new Error(error.message);
  });

  try {
    await Promise.all(updates);
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
