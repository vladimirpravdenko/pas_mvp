import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { buildSemanticData } from '@/lib/transformDialogue';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useAppContext } from '@/contexts/AppContext';

interface Option {
  label: string;
  value: string;
}

interface Template {
  id: number | string;
  field_name: string;
  question?: string;
  label?: string;
  field_type?: string;
  options?: Option[];
  order?: number;
}

interface DialogueWizardProps {
  templates?: Template[];
}
const DialogueWizard: React.FC<DialogueWizardProps> = ({ templates: initialTemplates }) => {
  const { preferredLanguage, refreshInitialDialogueResponses } = useAppContext();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates || []);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTemplates && initialTemplates.length) {
      setTemplates(initialTemplates);
      setLoading(false);
      setError(null);
      return;
    }

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
        setLoading(false);
        return;
      }

      const templatesData = data || [];
      const optionTemplateIds = templatesData
        .filter(
          (t) =>
            (t.field_type === 'select' || t.field_type === 'slider') &&
            t.field_name !== 'mood'
        )
        .map((t) => t.id);

      const optionsMap: Record<string | number, Option[]> = {};
      if (optionTemplateIds.length) {
        const { data: opts, error: optsError } = await supabase
          .from('initial_dialogue_options')
          .select('*')
          .in('template_id', optionTemplateIds)
          .order('order');

        if (optsError) {
          console.error('Failed to load dialogue options', optsError);
        } else if (opts) {
          for (const opt of opts) {
            const key = opt.template_id as string | number;
            if (!optionsMap[key]) optionsMap[key] = [];
            optionsMap[key].push({ label: opt.label, value: opt.value });
          }
        }
      }

      const templatesWithOptions = templatesData.map((t) => ({
        ...t,
        options: optionsMap[t.id] || undefined,
      }));

      setTemplates(templatesWithOptions);
      setLoading(false);
    };

    loadTemplates();
  }, [initialTemplates, preferredLanguage]);

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
      const {
        data: { user: sessionUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (!sessionUser) {
        console.error('Get user error:', userError);
        setError('Failed to save: missing user session');
        return;
      }

      // Check that all required fields have been answered
      for (const t of templates) {
        const value = answers[t.field_name];
        const missing =
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0);
        if (missing) {
          setError(
            `Please provide an answer for "${t.question || t.label || t.field_name}".`
          );
          setSaving(false);
          return;
        }
      }

      const payload = templates.map((t) => ({
        user_id: sessionUser.id,
        template_id: t.id,
        response: answers[t.field_name],
      }));

      const { error: insertError } = await supabase
        .from('user_initial_dialogue_responses')
        .insert(payload);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to save: Supabase insert failed');
        return;
      }

      // Build a structured JSON object from the user's answers.
      // This feeds the prompt builder so the AI can generate personalised lyrics and audio.
      const semanticData = buildSemanticData(templates, answers);

      const text = templates
        .map((t) => {
          const label = t.question || t.label || t.field_name;
          const val = Array.isArray(answers[t.field_name])
            ? (answers[t.field_name] as unknown[]).join(', ')
            : answers[t.field_name];
          return `${label}: ${val}`;
        })
        .join('\n');

      setSummary(text);
      console.debug('Prompt data', semanticData);
      await refreshInitialDialogueResponses();
    } catch (err) {
      console.error('Failed to save responses', err);
      setError('Failed to save');
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
  const fieldType =
    template.field_name === 'mood' ? 'text' : template.field_type || 'text';
  const value =
    answers[template.field_name] ??
    (fieldType === 'multiselect' ? [] : fieldType === 'slider' ? undefined : '');

  const renderField = () => {
    switch (fieldType) {
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
            value={value ?? ''}
            onChange={e => handleChange(template.field_name, e.target.value)}
          >
            <option value="">Select...</option>
            {template.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'slider': {
        const numericOptions = template.options
          ?.map((o) => Number(o.value))
          .filter((n) => !Number.isNaN(n));
        const min = numericOptions?.length ? Math.min(...numericOptions) : 0;
        const max = numericOptions?.length ? Math.max(...numericOptions) : 100;
        const sliderValue =
          typeof value === 'number' ? value : min;
        return (
          <div className="px-2">
            <Slider
              min={min}
              max={max}
              value={[sliderValue]}
              onValueChange={(v) => handleChange(template.field_name, v[0])}
            />
          </div>
        );
      }
      case 'multiselect':
        return (
          <div className="space-y-1">
            {template.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={e => {
                    let vals: string[] = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      vals.push(opt.value);
                    } else {
                      vals = vals.filter(v => v !== opt.value);
                    }
                    handleChange(template.field_name, vals);
                  }}
                />
                <span>{opt.label}</span>
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
        <h2 className="text-lg font-semibold">{template.question || template.label}</h2>
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
