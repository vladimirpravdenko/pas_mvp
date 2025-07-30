import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { buildSemanticData } from '@/lib/transformDialogue';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/contexts/AppContext';

interface Template {
  id: number;
  field_name: string;
  question: string;
  field_type: string;
  options?: string[] | null;
  order: number;
}

const DialogueWizard: React.FC = () => {
  const { user, preferredLanguage, refreshInitialDialogueResponses } = useAppContext();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('initial_dialogue_templates')
        .select('*')
        .eq('is_active', true)
        .eq('language', preferredLanguage || 'en')
        .order('order');
      if (error) {
        console.error('Failed to load templates', error);
        setError('Failed to load templates');
        setTemplates([]);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    };
    loadTemplates();
  }, [preferredLanguage]);

  const handleChange = (name: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    if (current < templates.length - 1) {
      setCurrent((c) => c + 1);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!user) {
        setError('User not found');
        return;
      }

      const payload = templates.map((t) => ({
        user_id: user.id,
        template_id: t.id,
        response: answers[t.field_name] ?? null,
      }));

      const { error } = await supabase
        .from('user_initial_dialogue_responses')
        .insert(payload);

      if (error) {
        console.error('Failed to save responses', error);
        setError('Failed to save responses');
        return;
      }

      // Build a structured JSON object from the user's answers.
      // This feeds the prompt builder so the AI can generate personalised lyrics and audio.
      const semanticData = buildSemanticData(templates, answers);

      const text = templates
        .map((t) =>
          `${t.question}: ${Array.isArray(answers[t.field_name]) ? (answers[t.field_name] as unknown[]).join(', ') : answers[t.field_name]}`,
        )
        .join('\n');

      setSummary(text);
      console.debug('Prompt data', semanticData);
      await refreshInitialDialogueResponses();
    } catch (err) {
      console.error('Failed to save responses', err);
      setError('Failed to save responses');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => setCurrent(c => Math.max(0, c - 1));

  if (summary) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Summary</h2>
        <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md border border-border">{summary}</pre>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!templates.length) {
    return <div className="p-4 text-yellow-600">No dialogue templates found.</div>;
  }

  const template = templates[current];
  const value = answers[template.field_name] ?? (template.field_type === 'multiselect' ? [] : '');

  const renderField = () => {
    switch (template.field_type) {
      case 'textarea':
      case 'paragraph':
        return (
          <textarea
            className="w-full border rounded p-2"
            value={value}
            onChange={e => handleChange(template.field_name, e.target.value)}
          />
        );
      case 'select':
        return (
          <select
            className="w-full border rounded p-2"
            value={value}
            onChange={e => handleChange(template.field_name, e.target.value)}
          >
            <option value="">Select...</option>
            {template.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'multiselect':
        return (
          <div className="space-y-1">
            {template.options?.map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(opt)}
                  onChange={e => {
                    let vals: string[] = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      vals.push(opt);
                    } else {
                      vals = vals.filter(v => v !== opt);
                    }
                    handleChange(template.field_name, vals);
                  }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => handleChange(template.field_name, e.target.checked)}
            />
            <span>Yes</span>
          </label>
        );
      case 'text[]':
      case 'tag[]':
        return (
          <input
            className="w-full border rounded p-2"
            type="text"
            placeholder="Comma separated values"
            value={value}
            onChange={e => handleChange(template.field_name, e.target.value)}
          />
        );
      case 'text':
      default:
        return (
          <input
            className="w-full border rounded p-2"
            type="text"
            value={value}
            onChange={e => handleChange(template.field_name, e.target.value)}
          />
        );
    }
  };

  const progressValue = (current / templates.length) * 100;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <Progress value={progressValue} />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{template.question}</h2>
        {renderField()}
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" disabled={current === 0} onClick={handleBack}>Back</Button>
        <Button onClick={handleNext} disabled={saving}>
          {current === templates.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default DialogueWizard;
