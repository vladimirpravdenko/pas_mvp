import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PromptPreviewProps {
  prompt: string;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt }) => {
  if (!prompt) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Prompt Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm font-mono">{prompt}</pre>
      </CardContent>
    </Card>
  );
};
