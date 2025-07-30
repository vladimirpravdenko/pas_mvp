import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import InitialDialogueForm from '@/components/InitialDialogueForm';

const InitialDialoguePage: React.FC = () => (
  <AppProvider>
    <InitialDialogueForm />
  </AppProvider>
);

export default InitialDialoguePage;
