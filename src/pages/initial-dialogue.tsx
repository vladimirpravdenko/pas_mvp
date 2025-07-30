import React from 'react';
import DialogueWizard from '@/components/InitialDialogue/DialogueWizard';
import { AppProvider } from '@/contexts/AppContext';

const InitialDialoguePage: React.FC = () => (
  <AppProvider>
    <DialogueWizard />
  </AppProvider>
);

export default InitialDialoguePage;
