CREATE TABLE IF NOT EXISTS public."usr_nmexs7bytxq2_fox_spirits" (
  user_id text PRIMARY KEY,
  display_name text NOT NULL,
  sigil_path text NOT NULL,
  current_x int NOT NULL DEFAULT 11,
  current_y int NOT NULL DEFAULT 4,
  embers_collected text[] NOT NULL DEFAULT '{}',
  npcs_talked_to text[] NOT NULL DEFAULT '{}',
  monsters_defeated text[] NOT NULL DEFAULT '{}',
  xp int NOT NULL DEFAULT 0,
  power_level int NOT NULL DEFAULT 0,
  coins int NOT NULL DEFAULT 30,
  weapons_owned text[] NOT NULL DEFAULT '{}',
  power_ups_owned text[] NOT NULL DEFAULT '{}',
  equipped_weapon text,
  awakened_at timestamptz,
  awakening_sigil_path text,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ADD COLUMN IF NOT EXISTS monsters_defeated text[] NOT NULL DEFAULT '{}';
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ADD COLUMN IF NOT EXISTS power_level int NOT NULL DEFAULT 0;
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ADD COLUMN IF NOT EXISTS coins int NOT NULL DEFAULT 30;
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ADD COLUMN IF NOT EXISTS weapons_owned text[] NOT NULL DEFAULT '{}';
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ADD COLUMN IF NOT EXISTS power_ups_owned text[] NOT NULL DEFAULT '{}';
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ADD COLUMN IF NOT EXISTS equipped_weapon text;
ALTER TABLE public."usr_nmexs7bytxq2_fox_spirits" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_user_access" ON public."usr_nmexs7bytxq2_fox_spirits";
CREATE POLICY "auth_user_access" ON public."usr_nmexs7bytxq2_fox_spirits" FOR ALL TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public."usr_nmexs7bytxq2_fox_spirits" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."usr_nmexs7bytxq2_fox_spirits" TO service_role;

CREATE TABLE IF NOT EXISTS public."usr_nmexs7bytxq2_ember_finds" (
  ember_id text NOT NULL,
  finder_user_id text NOT NULL,
  display_name text NOT NULL,
  found_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ember_id, finder_user_id),
  CONSTRAINT "usr_nmexs7bytxq2_ember_id_check" CHECK (ember_id IN ('hearth','lullaby','wayfarer','forge','spring','cradle'))
);
ALTER TABLE public."usr_nmexs7bytxq2_ember_finds" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "all_authenticated_select" ON public."usr_nmexs7bytxq2_ember_finds";
DROP POLICY IF EXISTS "own_insert" ON public."usr_nmexs7bytxq2_ember_finds";
CREATE POLICY "all_authenticated_select" ON public."usr_nmexs7bytxq2_ember_finds" FOR SELECT TO authenticated USING (true);
CREATE POLICY "own_insert" ON public."usr_nmexs7bytxq2_ember_finds" FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = finder_user_id);
GRANT SELECT, INSERT ON public."usr_nmexs7bytxq2_ember_finds" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."usr_nmexs7bytxq2_ember_finds" TO service_role;

CREATE OR REPLACE FUNCTION public."usr_nmexs7bytxq2_sync_embers"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."usr_nmexs7bytxq2_fox_spirits"
  SET embers_collected = COALESCE((
      SELECT array_agg(ember_id ORDER BY found_at)
      FROM public."usr_nmexs7bytxq2_ember_finds"
      WHERE finder_user_id = NEW.finder_user_id
    ), '{}'),
    xp = xp + 5,
    last_active_at = now()
  WHERE user_id = NEW.finder_user_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS "usr_nmexs7bytxq2_after_ember_insert" ON public."usr_nmexs7bytxq2_ember_finds";
CREATE TRIGGER "usr_nmexs7bytxq2_after_ember_insert"
AFTER INSERT ON public."usr_nmexs7bytxq2_ember_finds"
FOR EACH ROW EXECUTE FUNCTION public."usr_nmexs7bytxq2_sync_embers"();

CREATE OR REPLACE FUNCTION public."usr_nmexs7bytxq2_codex"()
RETURNS TABLE (ember_id text, finder_user_id text, display_name text, found_at timestamptz, sigil_path text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.ember_id, f.finder_user_id, f.display_name, f.found_at, s.sigil_path
  FROM public."usr_nmexs7bytxq2_ember_finds" f
  LEFT JOIN public."usr_nmexs7bytxq2_fox_spirits" s ON s.user_id = f.finder_user_id
  ORDER BY f.found_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public."usr_nmexs7bytxq2_codex"() TO authenticated;

CREATE OR REPLACE FUNCTION public."usr_nmexs7bytxq2_awakened"()
RETURNS TABLE (user_id text, display_name text, awakened_at timestamptz, awakening_sigil_path text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, display_name, awakened_at, awakening_sigil_path
  FROM public."usr_nmexs7bytxq2_fox_spirits"
  WHERE awakened_at IS NOT NULL AND awakening_sigil_path IS NOT NULL
  ORDER BY awakened_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public."usr_nmexs7bytxq2_awakened"() TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public."usr_nmexs7bytxq2_ember_finds";
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
