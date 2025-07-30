import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Template {
  id: number;
  field_name: string;
  question: string;
  field_type: string;
  options?: string[] | null;
  order: number;
}

const DialogueWizard: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [current, setCurrent] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      const { data, error } = await supabase
        .from('initial_dialogue_templates')
        .select('*')
        .eq('active', true)
        .order('order');
      if (!error) {
        setTemplates(data || []);
      } else {
        console.error('Failed to load templates', error);
      }
    };
    loadTemplates();
  }, []);

  const handleChange = (name: string, value: any) => {
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    if (current < templates.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setSaving(true);
      try {
        const payload = templates.map(t => ({
          template_id: t.id,
          value: answers[t.field_name] ?? null,
        }));
        const { error } = await supabase
          .from('user_initial_dialogue_responses')
          .insert(payload);
        if (error) {
          console.error('Failed to save responses', error);
        } else {
          const text = templates
            .map(t => `${t.question}: ${Array.isArray(answers[t.field_name]) ? (answers[t.field_name] as any[]).join(', ') : answers[t.field_name]}`)
            .join('\n');
          setSummary(text);
        }
      } finally {
        setSaving(false);
      }
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

  if (!templates.length) {
    return <div className="p-4">Loading...</div>;
  }

  const template = templates[current];
  const value = answers[template.field_name] ?? (template.field_type === 'multiselect' ? [] : '');

  const renderField = () => {
    switch (template.field_type) {
      case 'textarea':
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
