import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QA {
  question: string;
  answer: string;
}

const MAX_QUESTIONS = 5;

const InitialDialogueInner: React.FC = () => {
  const { user, refreshInitialDialogueResponses } = useAppContext();
  const [dialogue, setDialogue] = useState<QA[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);

  const fetchQuestion = async (ctx: QA[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai_router', {
        body: { mode: 'interview', context: ctx },
      });
      if (error) throw error;
      setQuestion((data as { question?: string })?.question || '');
    } catch (err) {
      console.error('Failed to load question', err);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion([]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newDialogue = [...dialogue, { question, answer }];
    setSaving(true);
    try {
      await supabase.from('user_initial_dialogue_responses').insert({
        user_id: user.id,
        responses: { question, answer },
      });
      setDialogue(newDialogue);
      setAnswer('');
      if (newDialogue.length >= MAX_QUESTIONS) {
        setFinished(true);
        await refreshInitialDialogueResponses();
      } else {
        await fetchQuestion(newDialogue);
      }
    } catch (err) {
      console.error('Failed to save answer', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (finished) return <div className="p-4">Thanks for sharing!</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="text-lg font-medium">{question}</div>
      <Input value={answer} onChange={(e) => setAnswer(e.target.value)} required />
      <Button type="submit" disabled={saving}>
        Next
      </Button>
    </form>
  );
};

export default function InitialDialoguePage() {
  return (
    <AppProvider>
      <InitialDialogueInner />
    </AppProvider>
  );
}

