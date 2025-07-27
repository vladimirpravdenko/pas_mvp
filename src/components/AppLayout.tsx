import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { AuthPage } from './AuthPage';
import { Dashboard } from './Dashboard';

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAppContext();

  return (
    <div className="min-h-screen">
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </div>
  );
};

export default AppLayout;