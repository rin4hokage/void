# Land of Fire Mission Control

This Lovable app uses Supabase for auth, tasks, projects, comms, agents, and scheduled hub runs.

## Required environment variables

Create or update `.env` with:

```env
VITE_SUPABASE_URL="https://fulmdnwjgvvqwuehroyk.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-or-publishable-key"
```

## Supabase project link

The local Supabase config is linked to project ref `fulmdnwjgvvqwuehroyk`.

## App behavior

- Unauthenticated users are sent to the auth screen.
- Authenticated users can create and update their own tasks, projects, and comms.
- The calendar reads task due dates and scheduled hub runs from Supabase.
