import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Key, AlertTriangle } from 'lucide-react';

export const ApiKeyHelper: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Key className="h-5 w-5" />
          Suno API Configuration Required
        </CardTitle>
        <CardDescription className="text-orange-700">
          To generate audio, you need to configure your Suno API key properly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-300 bg-orange-100">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>No requests are reaching Suno API.</strong> This suggests an authentication or endpoint issue.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-orange-800">Required Information:</h4>
          <ul className="space-y-2 text-sm text-orange-700">
            <li className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <div>
                <strong>Suno API Key:</strong> Your authentication token from Suno AI
                <br />
                <span className="text-xs">Should start with 'sess-' or similar format</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <div>
                <strong>Account Status:</strong> Ensure your Suno account has:
                <ul className="ml-4 mt-1 list-disc text-xs">
                  <li>Active subscription or credits</li>
                  <li>API access enabled</li>
                  <li>Correct API endpoint permissions</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <div>
                <strong>API Endpoint:</strong> Verify you're using the correct Suno API
                <br />
                <span className="text-xs">Currently using: studio-api.suno.ai</span>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-orange-800">Troubleshooting Steps:</h4>
          <ol className="space-y-1 text-sm text-orange-700 list-decimal list-inside">
            <li>Check your Suno dashboard for API key format</li>
            <li>Verify your account has sufficient credits</li>
            <li>Ensure API access is enabled in your Suno settings</li>
            <li>Try regenerating your API key if requests still fail</li>
          </ol>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://suno.ai', '_blank')}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visit Suno AI
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const settingsTab = document.querySelector('[data-tab="settings"]') as HTMLElement;
              if (settingsTab) {
                settingsTab.click();
              }
            }}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <Key className="h-3 w-3 mr-1" />
            Go to Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};