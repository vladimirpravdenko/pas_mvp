# React + TypeScript + Vite

Hello, world! This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Database Migrations

SQL files live in `supabase/migrations`. Apply them with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <project-id>
supabase db push
```

The migration `003_update_initial_dialogue_templates.sql` adds `is_active`,
`language`, and `order` columns to the `initial_dialogue_templates` table and
populates existing rows with an ordering based on creation time.
