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
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dialogue', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Uses Supabase auth.signInWithPassword and auth.signUp for email/password auth.
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        if (signInError?.message === 'Invalid login credentials') {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) {
            setError(signUpError.message);
          } else {
            setMessage('Account created. Please check your email to confirm and then log in.');
          }
        } else {
          setError(signInError?.message || 'Login failed');
        }
        return;
      }

      navigate('/dialogue');
    } finally {
      setLoading(false);
    }
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
        {message && <div className="text-green-500 text-sm">{message}</div>}
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

