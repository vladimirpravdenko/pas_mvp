import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

interface WebhookLog {
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  rawBody: string;
  parsedPayload?: unknown;
  processed?: number;
  error?: string;
}

export function WebhookPayloadViewer() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: songs, error } = await supabase
        .from('songs')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching songs:', error);
        return;
      }

      const songLogs: WebhookLog[] = (songs || []).map(song => ({
        timestamp: song.received_at || new Date().toISOString(),
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        rawBody: JSON.stringify({
          data: [{
            id: song.suno_id,
            title: song.title,
            audio_url: song.audio_url,
            status: song.status,
            prompt: song.prompt,
            lyric: song.lyric,
            image_url: song.image_url,
            video_url: song.video_url,
            model_name: song.model_name,
            type: song.type,
            tags: song.tags
          }]
        }, null, 2),
        parsedPayload: {
          data: [{
            id: song.suno_id,
            title: song.title,
            audio_url: song.audio_url,
            status: song.status,
            prompt: song.prompt,
            lyric: song.lyric,
            image_url: song.image_url,
            video_url: song.video_url,
            model_name: song.model_name,
            type: song.type,
            tags: song.tags
          }]
        },
        processed: 1
      }));

      setLogs(songLogs);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SunoAPI Webhook Payloads</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRawData(!showRawData)}
          >
            {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showRawData ? 'Hide Raw' : 'Show Raw'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No webhook payloads received yet. Generate a song to see SunoAPI webhook data.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {logs.map((log, index) => (
            <Card key={index} className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedLog(selectedLog === log ? null : log)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Webhook Payload #{logs.length - index}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{log.method}</Badge>
                    {log.processed && (
                      <Badge variant="secondary">{log.processed} songs</Badge>
                    )}
                    {log.error && <Badge variant="destructive">Error</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </CardHeader>
              
              {selectedLog === log && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {showRawData && (
                      <div>
                        <h4 className="font-medium mb-2">Raw Body:</h4>
                        <ScrollArea className="h-32 w-full border rounded p-2">
                          <pre className="text-xs">{log.rawBody}</pre>
                        </ScrollArea>
                      </div>
                    )}
                    
                    {log.parsedPayload && (
                      <div>
                        <h4 className="font-medium mb-2">Parsed Payload:</h4>
                        <ScrollArea className="h-48 w-full border rounded p-2">
                          <pre className="text-xs">
                            {JSON.stringify(log.parsedPayload, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                    
                    {log.error && (
                      <div>
                        <h4 className="font-medium mb-2 text-destructive">Error:</h4>
                        <p className="text-sm text-destructive">{log.error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}