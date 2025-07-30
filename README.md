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

## Environment Variables

Copy `.env.example` to `.env` in the project root. It already includes the
credentials for the shared Supabase instance:

```bash
SUPABASE_URL=https://abhhiplxeaawdnxnjovf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaGhpcGx4ZWFhd2RueG5qb3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTg4MDEsImV4cCI6MjA2OTAzNDgwMX0.QcAMwj1cLYXOppRR71Vbzq2J4ao6YtngNUpXkbWNGtE
```

These variables are required for both local development and deployment.
