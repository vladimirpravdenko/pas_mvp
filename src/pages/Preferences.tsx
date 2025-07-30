import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateSongPrompt } from '@/lib/supabase/promptBuilder';
import { PromptPreview } from '@/components/PromptPreview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Preferences: React.FC = () => {
  const { user } = useAppContext();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const fetchPrompt = async () => {
      if (user?.id) {
        try {
          const p = await generateSongPrompt(user.id);
          setPrompt(p);
        } catch (error) {
          console.error('Failed to build prompt', error);
        }
      }
    };
    fetchPrompt();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Your initial dialogue responses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            These preferences are used to generate a personalised song prompt.
          </p>
        </CardContent>
      </Card>
      <PromptPreview prompt={prompt} />
    </div>
  );
};

export default Preferences;
