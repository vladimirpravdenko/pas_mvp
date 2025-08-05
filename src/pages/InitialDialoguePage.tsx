import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InitialDialogueForm from '@/components/InitialDialogueForm';

interface QA {
  q: string;
  a: string;
}

const InitialDialogueInner: React.FC = () => {
  const { user } = useAppContext();
  const [context, setContext] = useState<QA[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      setLoading(true);

      const { data: existing } = await supabase
        .from('user_initial_dialogue_responses')
        .select('responses')
        .eq('user_id', user.id)
        .single();

      if (existing?.responses) {
        setContext(existing.responses as QA[]);
        setShowForm(true);
        setLoading(false);
        return;
      }

      const { count } = await supabase
        .from('initial_dialogue_templates')
        .select('id', { count: 'exact', head: true })
        .eq('active', true);
      setTotalQuestions(count ?? null);

      await fetchQuestion([]);
    };
    init();
  }, [user]);

  const fetchQuestion = async (ctx: QA[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai_router', {
        body: { mode: 'interview', context: ctx },
      });
      if (error) throw error;
      if ((data as { done?: boolean }).done) {
        setShowForm(true);
        setContext(ctx);
      } else {
        const nextQuestion =
          (data as { question?: string }).question ||
          (data as { prompt?: string }).prompt ||
          '';
        setQuestion(nextQuestion);
      }
    } catch (err) {
      console.error('Failed to load question', err);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCtx = [...context, { q: question, a: answer }];
    setContext(newCtx);
    setAnswer('');
    await fetchQuestion(newCtx);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (showForm) return <InitialDialogueForm initialAnswers={context} />;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-xl mx-auto">
      {totalQuestions !== null && (
        <div className="text-sm text-muted-foreground">
          Question {context.length + 1} of {totalQuestions}
        </div>
      )}
      <div className="text-lg font-medium">{question}</div>
      <Input value={answer} onChange={(e) => setAnswer(e.target.value)} required />
      <Button type="submit">Next</Button>
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

