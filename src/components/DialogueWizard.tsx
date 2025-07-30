import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface DialogueTemplate {
  id: number;
  label: string;
  field_name: string;
  field_type: 'text' | 'text[]' | 'tag[]' | 'paragraph';
  order: number;
  is_active: boolean;
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
        .eq('is_active', true)
        .eq('language', preferredLanguage || 'en')
        .order('order', { ascending: true });

      if (error) {
        console.error('Failed to load dialogue templates:', error);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    };

    fetchTemplates();
  }, [preferredLanguage]);

  if (loading) return <p>Loading templates...</p>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Let's get to know you</h3>
      {templates.map(template => (
        <div key={template.id} className="flex flex-col gap-1">
          <label className="font-semibold" htmlFor={template.field_name}>
            {template.label}
          </label>
          <input
            id={template.field_name}
            className="border p-2 rounded-md"
            placeholder="Type your answer..."
          />
        </div>
      ))}
    </div>
  );
};

export default DialogueWizard;
