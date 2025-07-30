import React from 'react';
import { DialogueTemplate } from '@/data/dialogueTemplates';

interface Props {
  templates: DialogueTemplate[];
}

export const DialogueWizard: React.FC<Props> = ({ templates }) => {
  return (
    <div className="space-y-4">
      {templates.filter(t => t.is_active).map(t => (
        <div key={t.id} className="flex flex-col gap-1">
          <label className="font-semibold" htmlFor={t.field_name}>{t.label}</label>
          <input id={t.field_name} className="border p-2 rounded-md" />
        </div>
      ))}
    </div>
  );
};
