import React from 'react';

interface PromptPreviewProps {
  responses: Record<string, any>;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ responses }) => {
  return (
    <div className="max-w-2xl mx-auto p-4 border rounded-md bg-white/50">
      <pre className="whitespace-pre-wrap text-sm">
        {JSON.stringify(responses, null, 2)}
      </pre>
    </div>
  );
};

export default PromptPreview;
