import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for webhook data
const webhookData = new Map<string, unknown>();

export function setWebhookData(id: string, data: unknown) {
  webhookData.set(id, data);
}

export function getWebhookData(id: string) {
  return webhookData.get(id);
}

export function getAllWebhookData() {
  return Array.from(webhookData.values());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set JSON headers immediately
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Only GET allowed' });
    }

    const { taskId } = req.query;

    if (taskId && typeof taskId === 'string') {
      const data = getWebhookData(taskId);
      return res.status(200).json({ 
        success: true,
        data: data ? [data] : []
      });
    }

    const allData = getAllWebhookData();
    return res.status(200).json({ 
      success: true,
      data: allData
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve data'
    });
  }
}