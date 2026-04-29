
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.note_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  user_id uuid NOT NULL,
  body text NOT NULL,
  change_type text NOT NULL DEFAULT 'edit',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.note_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "note_revisions_all_own" ON public.note_revisions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_note_revisions_note ON public.note_revisions(note_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.record_note_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.body IS DISTINCT FROM NEW.body THEN
    INSERT INTO public.note_revisions (note_id, contact_id, user_id, body, change_type)
    VALUES (OLD.id, OLD.contact_id, OLD.user_id, OLD.body, 'edit');
    NEW.updated_at = now();
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.note_revisions (note_id, contact_id, user_id, body, change_type)
    VALUES (OLD.id, OLD.contact_id, OLD.user_id, OLD.body, 'delete');
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS notes_revision_update ON public.notes;
CREATE TRIGGER notes_revision_update BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.record_note_revision();

DROP TRIGGER IF EXISTS notes_revision_delete ON public.notes;
CREATE TRIGGER notes_revision_delete BEFORE DELETE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.record_note_revision();
