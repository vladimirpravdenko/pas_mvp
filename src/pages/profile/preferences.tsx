import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PromptPreview from '@/components/PromptPreview';

const PreferencesInner: React.FC = () => {
  const { user } = useAppContext();
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_initial_dialogue_responses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setResponses(data);
      }
      setLoading(false);
    };
    loadResponses();
  }, [user]);

  const saveField = async (key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    if (!user) return;
    await supabase
      .from('user_initial_dialogue_responses')
      .update({ [key]: value })
      .eq('user_id', user.id);
  };

  if (!user) return null;
  if (loading) return <div className="p-4">Loading...</div>;

  const fields = Object.entries(responses).filter(
    ([k]) => !['id', 'user_id', 'created_at'].includes(k)
  );

  return (
    <div className="p-4 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              {String(value ?? '').length > 60 ? (
                <Textarea
                  value={value ?? ''}
                  onChange={(e) => saveField(key, e.target.value)}
                  onBlur={(e) => saveField(key, e.target.value)}
                  className="min-h-[80px]"
                />
              ) : (
                <Input
                  value={value ?? ''}
                  onChange={(e) => saveField(key, e.target.value)}
                  onBlur={(e) => saveField(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <PromptPreview responses={responses} />
    </div>
  );
};

const PreferencesPage: React.FC = () => (
  <AppProvider>
    <PreferencesInner />
  </AppProvider>
);

export default PreferencesPage;
