UPDATE initial_dialogue_templates
SET field_type = 'text'
WHERE field_name = 'mood';
DELETE FROM initial_dialogue_options WHERE template_id IN (SELECT id FROM initial_dialogue_templates WHERE field_name = 'mood');
