import React, { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthPage } from './AuthPage';
import { Dashboard } from './Dashboard';

const AppLayout: React.FC = () => {
  const { isAuthenticated, hasInitialDialogueResponses } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      if (!hasInitialDialogueResponses && location.pathname !== '/initial-dialogue') {
        navigate('/initial-dialogue', { replace: true });
      } else if (hasInitialDialogueResponses && location.pathname === '/initial-dialogue') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, hasInitialDialogueResponses, location.pathname]);

  return (
    <div className="min-h-screen">
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </div>
  );
};

export default AppLayout;