export interface DialogueTemplate {
  id: string;
  field_name: string;
  label: string;
  is_active: boolean;
}

export const initial_dialogue_templates: DialogueTemplate[] = [
  { id: '1', field_name: 'goal', label: 'Goal', is_active: true },
  { id: '2', field_name: 'obstacle', label: 'Obstacle', is_active: true },
  { id: '3', field_name: 'feeling', label: 'Feeling', is_active: true },
];
