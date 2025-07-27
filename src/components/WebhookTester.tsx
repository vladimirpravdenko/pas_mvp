import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Webhook, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
  responseText?: string;
}

export const WebhookTester: React.FC = () => {
  const [testPayload, setTestPayload] = useState(JSON.stringify({
    data: [{
      id: 'test-song-123',
      title: 'Test Song',
      audio_url: 'https://cdn1.suno.ai/test.mp3',
      prompt: 'Test prompt for webhook',
      status: 'complete',
      image_url: 'https://cdn1.suno.ai/test.jpg',
      lyric: 'Test lyrics here',
      video_url: null,
      model_name: 'V4',
      gpt_description_prompt: null,
      type: 'gen',
      tags: 'test'
    }]
  }, null, 2));
  
  // Use the correct function URL with function name
  const [webhookUrl, setWebhookUrl] = useState('https://abhhiplxeaawdnxnjovf.supabase.co/functions/v1/suno-webhook');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testWebhook = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      let payload;
      try {
        payload = JSON.parse(testPayload);
      } catch (jsonError) {
        setTestResult({
          success: false,
          status: 0,
          error: `Invalid JSON: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`
        });
        return;
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      let data;
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (isJson) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          setTestResult({
            success: false,
            status: response.status,
            error: `Response parsing error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            responseText: responseText.substring(0, 500)
          });
          return;
        }
      } else {
        const isHtml = responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');
        setTestResult({
          success: false,
          status: response.status,
          error: isHtml 
            ? 'Webhook returned HTML instead of JSON - check if URL is correct'
            : 'Non-JSON response received',
          responseText: responseText.substring(0, 200)
        });
        return;
      }
      
      setTestResult({
        success: response.ok,
        status: response.status,
        data,
        error: response.ok ? undefined : data.error || 'Request failed'
      });
    } catch (error) {
      setTestResult({
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Integration Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://abhhiplxeaawdnxnjovf.supabase.co/functions/v1/suno-webhook"
            />
            <p className="text-sm text-gray-600 mt-1">Use this URL in your SunoAPI callBackUrl parameter</p>
          </div>
          
          <div>
            <Label htmlFor="test-payload">Test Payload (JSON)</Label>
            <Textarea
              id="test-payload"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          
          <Button 
            onClick={testWebhook} 
            disabled={isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Testing...' : 'Test Webhook'}
          </Button>
        </CardContent>
      </Card>
      
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge variant={testResult.success ? 'default' : 'destructive'}>
                Status: {testResult.status}
              </Badge>
              
              {testResult.error && (
                <Alert variant="destructive">
                  <AlertDescription>{testResult.error}</AlertDescription>
                </Alert>
              )}
              
              {testResult.data && (
                <div>
                  <Label>Response:</Label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResult.responseText && (
                <div>
                  <Label>Raw Response:</Label>
                  <pre className="bg-red-50 p-3 rounded text-sm overflow-auto border border-red-200">
                    {testResult.responseText}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};