// Edge function to route AI requests to either a local LLM or OpenAI.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RouterRequest {
  mode: "interview" | "song";
  context?: unknown;
  persona?: string;
  instruction?: string;
  user_profile?: unknown;
  dialogue?: string;
}

interface RouterResponse {
  output_type: "question" | "lyrics";
  lyrics?: string;
  prompt?: string;
  question?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Invalid content type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: RouterRequest;
  try {
    body = (await req.json()) as RouterRequest;
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (body.mode !== "interview" && body.mode !== "song") {
    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const llmMode = Deno.env.get("LLM_MODE") ?? "local";

  const prompt =
    body.mode === "interview"
      ? buildInterviewPrompt(body)
      : buildSongPrompt(body);

  try {
    const llmResponse =
      llmMode === "openai"
        ? await callOpenAI(prompt)
        : await callLocalLLM(prompt);

    const responsePayload: RouterResponse =
      body.mode === "interview"
        ? {
            output_type: "question",
            question: llmResponse.question ?? llmResponse.text,
          }
        : {
            output_type: "lyrics",
            lyrics: llmResponse.lyrics,
            prompt: llmResponse.prompt,
          };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

function buildInterviewPrompt(req: RouterRequest): string {
  const persona = req.persona ? `You are ${req.persona}.` : "";
  const context = req.context ? `Context: ${JSON.stringify(req.context)}.` : "";
  const instruction = req.instruction ??
    "Generate the next emotionally focused interview question.";

  return `${persona}\n${context}\n${instruction}\nReturn JSON: {"question": "<text>"}`;
}

function buildSongPrompt(req: RouterRequest): string {
  const persona = req.persona ? `You are ${req.persona}.` : "";
  const profile = req.user_profile
    ? `User Profile: ${JSON.stringify(req.user_profile)}.`
    : "";
  const dialogue = req.dialogue ? `Dialogue: ${req.dialogue}` : "";
  const instruction = req.instruction ??
    "Create lyrics and a short Suno compatible music prompt.";

  return `${persona}\n${profile}\n${dialogue}\n${instruction}\nReturn JSON: {"lyrics": "...", "prompt": "..."}`;
}

async function callLocalLLM(prompt: string): Promise<Record<string, unknown>> {
  const endpoint = Deno.env.get("LLM_ENDPOINT") ?? "";
  const model = Deno.env.get("LLM_MODEL") ?? "";

  const res = await fetch(`${endpoint}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`LLM request failed with ${res.status}`);
  }

  const data = await res.json();
  const text: string = data.response ?? JSON.stringify(data);

  try {
    return JSON.parse(text);
  } catch (_e) {
    return { text };
  }
}

async function callOpenAI(prompt: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed with ${res.status}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  try {
    return JSON.parse(content);
  } catch (_e) {
    return { text: content };
  }
}

