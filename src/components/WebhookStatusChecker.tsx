import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface WebhookCheckResult {
  exists: boolean;
  accessible: boolean;
  responseTime?: number;
  error?: string;
  functionId?: string;
  response?: any;
}

export const WebhookStatusChecker: React.FC = () => {
  const [checkResult, setCheckResult] = useState<WebhookCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const webhookUrl = 'https://abhhiplxeaawdnxnjovf.supabase.co/functions/v1/suno-webhook';

  const checkWebhookStatus = async () => {
    setIsChecking(true);
    setCheckResult(null);
    
    const startTime = Date.now();
    
    try {
      // Test OPTIONS request first (CORS preflight)
      const optionsResponse = await fetch(webhookUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!optionsResponse.ok) {
        setCheckResult({
          exists: false,
          accessible: false,
          error: `OPTIONS request failed: ${optionsResponse.status} ${optionsResponse.statusText}`
        });
        return;
      }
      
      // Test POST request with minimal payload
      const testPayload = {
        data: [{
          id: 'webhook-test-' + Date.now(),
          title: 'Webhook Test',
          status: 'complete',
          audio_url: null,
          prompt: 'Test webhook',
          image_url: null,
          lyric: null,
          video_url: null,
          model_name: 'test',
          gpt_description_prompt: null,
          type: 'test',
          tags: null
        }]
      };
      
      const postResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = await postResponse.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
      
      setCheckResult({
        exists: true,
        accessible: postResponse.ok,
        responseTime,
        functionId: 'suno-webhook',
        response: responseData,
        error: postResponse.ok ? undefined : `HTTP ${postResponse.status}: ${responseData.error || responseText}`
      });
      
    } catch (error) {
      setCheckResult({
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Network error - function may not exist or be accessible'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Webhook Status Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Webhook URL:</p>
          <code className="block p-2 bg-gray-100 rounded text-xs break-all">
            {webhookUrl}
          </code>
        </div>
        
        <Button 
          onClick={checkWebhookStatus} 
          disabled={isChecking}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check Webhook Status'}
        </Button>
        
        {checkResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {checkResult.exists ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <Badge variant={checkResult.exists ? 'default' : 'destructive'}>
                {checkResult.exists ? 'Webhook Found' : 'Webhook Not Found'}
              </Badge>
            </div>
            
            {checkResult.exists && (
              <div className="flex items-center gap-2">
                {checkResult.accessible ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <Badge variant={checkResult.accessible ? 'default' : 'destructive'}>
                  {checkResult.accessible ? 'Accessible' : 'Access Failed'}
                </Badge>
              </div>
            )}
            
            {checkResult.responseTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Response time: {checkResult.responseTime}ms</span>
              </div>
            )}
            
            {checkResult.response && (
              <div>
                <p className="text-sm font-medium">Response:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(checkResult.response, null, 2)}
                </pre>
              </div>
            )}
            
            {checkResult.error && (
              <Alert variant="destructive">
                <AlertDescription>{checkResult.error}</AlertDescription>
              </Alert>
            )}
            
            {checkResult.exists && checkResult.accessible && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Webhook is working correctly! The function is deployed and responding.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};