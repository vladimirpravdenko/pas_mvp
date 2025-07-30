import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PromptPreviewProps {
  prompt?: string;
  responses?: Record<string, any>;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, responses }) => {
  if (!prompt && !responses) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Prompt Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {prompt && (
          <pre className="whitespace-pre-wrap text-sm font-mono">{prompt}</pre>
        )}
        {responses && !prompt && (
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {JSON.stringify(responses, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptPreview;
