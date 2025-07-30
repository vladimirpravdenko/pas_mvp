import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface DialogueTemplate {
  id: number;
  template: string;
  language?: string;
}

export const DialogueWizard: React.FC = () => {
  const { preferredLanguage } = useAppContext();
  const [templates, setTemplates] = useState<DialogueTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('initial_dialogue_templates')
        .select('*')
        .eq('language', preferredLanguage || 'en');

      if (error) {
        console.error('Failed to load dialogue templates:', error);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    };

    fetchTemplates();
  }, [preferredLanguage]);

  if (loading) {
    return <p>Loading templates...</p>;
  }

  return (
    <div>
      <h3>Templates ({preferredLanguage})</h3>
      <pre>{JSON.stringify(templates, null, 2)}</pre>
    </div>
  );
};

export default DialogueWizard;
