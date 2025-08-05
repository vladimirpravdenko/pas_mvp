import React, { useState, useEffect } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const LoginInner: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('user_initial_dialogue_responses')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        navigate(data && data.length > 0 ? '/dashboard' : '/initial-dialogue', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(signInError?.message || 'Login failed');
      setLoading(false);
      return;
    }

    const { data: dialogueData } = await supabase
      .from('user_initial_dialogue_responses')
      .select('id')
      .eq('user_id', data.user.id)
      .limit(1);

    navigate(dialogueData && dialogueData.length > 0 ? '/dashboard' : '/initial-dialogue');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default function LoginPage() {
  return (
    <AppProvider>
      <LoginInner />
    </AppProvider>
  );
}

