# React + TypeScript + Vite

Hello, world! This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.  


## Database Migrations

Apply row level security policies with:

```bash
psql $DATABASE_URL -f supabase/policies/initial_dialogue_templates.sql
psql $DATABASE_URL -f supabase/policies/user_initial_dialogue_responses.sql
```
