import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';

interface QA {
  q: string;
  a: string;
}

interface Props {
  initialAnswers: QA[];
}

const InitialDialogueForm: React.FC<Props> = ({ initialAnswers }) => {
  const { user, refreshInitialDialogueResponses } = useAppContext();
  const [answers, setAnswers] = useState<QA[]>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleChange = (index: number, value: string) => {
    setAnswers(prev => prev.map((qa, i) => (i === index ? { ...qa, a: value } : qa)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('user_initial_dialogue_responses').upsert(
        {
          user_id: user.id,
          responses: answers,
        },
        { onConflict: 'user_id' }
      );
      await refreshInitialDialogueResponses();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to save initial dialogue:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Review your answers before generating songs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {answers.map((qa, idx) => (
              <div key={idx} className="space-y-2">
                <Label htmlFor={`q-${idx}`}>{qa.q}</Label>
                <Input
                  id={`q-${idx}`}
                  value={qa.a}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialDialogueForm;
