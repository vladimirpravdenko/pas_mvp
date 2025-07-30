# React + TypeScript + Vite

Hello, world! This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Database migrations

SQL files live in `supabase/migrations`. Apply them with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <project-id>
supabase db push
```
