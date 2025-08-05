import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';

const InitialDialogueForm: React.FC = () => {
  const { user, refreshInitialDialogueResponses } = useAppContext();
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('user_initial_dialogue_responses').insert({
        user_id: user.id,
        response: goal,
        created_at: new Date().toISOString()
      });
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
          <CardDescription>Let us know your goals before generating songs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Why are you using PAS?</Label>
              <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialDialogueForm;
