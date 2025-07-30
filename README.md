# React + TypeScript + Vite

Hello, world! This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.  


## Dialogue templates

The `initial_dialogue_templates` table stores snippets used by the `DialogueWizard`. Each template now has an optional `language` column which defaults to `'en'`.

To add templates for a new language, insert rows with the desired language code:

```sql
insert into initial_dialogue_templates (template, language)
values ('Hola, \!Bienvenido!', 'es');
```

Omitting the language column will store the template as English.
