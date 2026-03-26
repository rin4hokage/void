
-- Drop old columns
ALTER TABLE public.tasks DROP COLUMN IF EXISTS project;
ALTER TABLE public.tasks DROP COLUMN IF EXISTS assignee;

-- Add new columns
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT '';
