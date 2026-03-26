CREATE TABLE public.scheduled_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  next_run_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled runs"
ON public.scheduled_runs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled runs"
ON public.scheduled_runs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled runs"
ON public.scheduled_runs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled runs"
ON public.scheduled_runs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
