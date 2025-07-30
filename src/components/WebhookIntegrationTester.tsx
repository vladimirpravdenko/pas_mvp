import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { downloadAndStore } from '@/services/audioStorage';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: unknown;
}

export const WebhookIntegrationTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (step: string, status: TestResult['status'], message: string, data?: unknown) => {
    setResults(prev => {
      const existing = prev.find(r => r.step === step);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      }
      return [...prev, { step, status, message, data }];
    });
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setResults([]);

    const testPayload = {
      data: [{
        id: "test-song-123",
        title: "Simulated Song",
        audio_url: "https://cdn.suno.ai/audio/test.mp3",
        prompt: "Calm instrumental test",
        status: "complete",
        image_url: "https://cdn.suno.ai/test.jpg",
        lyric: "Simulated lyrics here",
        created_at: "2025-07-25T17:00:50.910Z",
        model_name: "V4",
        type: "gen"
      }]
    };

    // Step 1: Test webhook POST
    updateResult('webhook', 'pending', 'Testing webhook POST request...');
    try {
      const response = await fetch('https://abhhiplxeaawdnxnjovf.supabase.co/functions/v1/suno-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      const webhookData = await response.json();
      
      if (webhookData.success && webhookData.processed > 0) {
        updateResult('webhook', 'success', `Webhook processed ${webhookData.processed} song(s)`, webhookData);
      } else {
        updateResult('webhook', 'error', `Unexpected webhook response: ${JSON.stringify(webhookData)}`, webhookData);
      }
    } catch (error) {
      updateResult('webhook', 'error', `Webhook request failed: ${error}`);
    }

    // Step 2: Verify Supabase storage
    updateResult('supabase', 'pending', 'Checking Supabase database...');
    try {
      const { data: songs, error } = await supabase
        .from('songs')
        .select('*')
        .eq('suno_id', 'test-song-123')
        .single();

      if (error) {
        updateResult('supabase', 'error', `Supabase query failed: ${error.message}`);
      } else if (songs) {
        updateResult('supabase', 'success', 'Song found in Supabase database', songs);
      } else {
        updateResult('supabase', 'error', 'Song not found in database');
      }
    } catch (error) {
      updateResult('supabase', 'error', `Database check failed: ${error}`);
    }

    // Step 3: Test audio download
    updateResult('audio', 'pending', 'Testing audio download...');
    try {
      const storedAudio = await downloadAndStore('https://cdn.suno.ai/audio/test.mp3', {
        id: 'test-song-123',
        title: 'Simulated Song',
        prompt: 'Calm instrumental test'
      });
      
      updateResult('audio', 'success', `Audio downloaded and stored: ${storedAudio.metadata.size} bytes`, {
        size: storedAudio.metadata.size,
        title: storedAudio.title
      });
    } catch (error) {
      updateResult('audio', 'error', `Audio download failed: ${error}`);
    }

    // Step 4: Verify IndexedDB storage
    updateResult('indexeddb', 'pending', 'Verifying IndexedDB storage...');
    try {
      const { audioStorage } = await import('@/services/audioStorage');
      const stored = await audioStorage.getStoredAudio('test-song-123');
      
      if (stored) {
        updateResult('indexeddb', 'success', `Audio verified in IndexedDB: ${stored.title}`, {
          title: stored.title,
          size: stored.metadata.size
        });
      } else {
        updateResult('indexeddb', 'error', 'Audio not found in IndexedDB');
      }
    } catch (error) {
      updateResult('indexeddb', 'error', `IndexedDB check failed: ${error}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      pending: 'secondary' as const
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Webhook Integration Test
        </CardTitle>
        <CardDescription>
          Full end-to-end test of Suno webhook integration without using real API credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runFullTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Full Integration Test'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-semibold">Test Results:</h3>
            
            {results.map((result, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium capitalize">{result.step}</span>
                    {getStatusBadge(result.status)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 ml-6">{result.message}</p>
                
                {result.data && (
                  <details className="ml-6">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                      View Data
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};