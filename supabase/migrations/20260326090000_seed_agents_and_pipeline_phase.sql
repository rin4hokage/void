ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS pipeline_phase SMALLINT NOT NULL DEFAULT 1
  CHECK (pipeline_phase BETWEEN 1 AND 8);

CREATE OR REPLACE FUNCTION public.seed_default_agents_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.agents (id, user_id, name, status)
  VALUES
    (gen_random_uuid(), target_user_id, 'Rin', 'idle'),
    (gen_random_uuid(), target_user_id, 'Hinata', 'idle'),
    (gen_random_uuid(), target_user_id, 'Mikasa', 'idle')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM public.seed_default_agents_for_user(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN SELECT id FROM auth.users LOOP
    PERFORM public.seed_default_agents_for_user(auth_user.id);
  END LOOP;
END;
$$;
