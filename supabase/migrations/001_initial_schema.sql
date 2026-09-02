-- ==============================================================================
-- Drone Soccer @ SRM AP — Initial Database Schema & Security Migration
-- Target: Supabase (PostgreSQL 15+)
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  reg_no TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  year TEXT,
  branch TEXT,
  block_residence TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'captain', 'organiser', 'admin')),
  waiver_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on email & role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper security-definer function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'organiser')
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. TEAMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  logo_url TEXT,
  captain_name TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  captain_phone TEXT,
  captain_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  training_addon BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);

-- ------------------------------------------------------------------------------
-- 3. TEAM MEMBERS / PILOTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Defender' CHECK (role IN ('Striker', 'Defender', 'Keeper', 'Tactician')),
  jersey_no INT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- ------------------------------------------------------------------------------
-- 4. MATCH SLOTS (WEEKLY BLOCK ROTATION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_no INT NOT NULL,
  match_date DATE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Wednesday', 'Thursday')),
  block TEXT NOT NULL, -- C V Raman Block, SR Block, X Lab, Admin Block
  venue TEXT NOT NULL,
  start_time TIME NOT NULL DEFAULT '16:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  capacity INT NOT NULL DEFAULT 8,
  required_active_players INT NOT NULL DEFAULT 3, -- 3 to 5 players per team
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(match_date, block, start_time)
);

CREATE INDEX IF NOT EXISTS idx_slots_date ON public.slots(match_date);

-- ------------------------------------------------------------------------------
-- 5. BOOKINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'waitlisted', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  qr_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(slot_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_slot ON public.bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_team ON public.bookings(team_id);

-- ------------------------------------------------------------------------------
-- 6. PAYMENTS (RAZORPAY RECONCILIATION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL DEFAULT 'registration' CHECK (purpose IN ('registration', 'training_recharge')),
  valid_week INT, -- which calendar week the training recharge is active for
  amount_paise INT NOT NULL DEFAULT 10000, -- ₹100 = 10000 paise
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT DEFAULT 'razorpay' CHECK (method IN ('razorpay', 'venue_upi', 'cash')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_team ON public.payments(team_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(razorpay_order_id);

-- ------------------------------------------------------------------------------
-- 7. MATCHES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
  round_no INT NOT NULL DEFAULT 1,
  team_a UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  team_b UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  score_a INT NOT NULL DEFAULT 0,
  score_b INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'forfeited')),
  winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  notes TEXT,
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- ------------------------------------------------------------------------------
-- 8. STANDINGS VIEW (DYNAMIC CALCULATION)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.standings AS
WITH match_results AS (
  -- Team A stats
  SELECT
    team_a AS team_id,
    1 AS played,
    CASE WHEN score_a > score_b THEN 1 ELSE 0 END AS won,
    CASE WHEN score_a = score_b THEN 1 ELSE 0 END AS drawn,
    CASE WHEN score_a < score_b THEN 1 ELSE 0 END AS lost,
    score_a AS goals_for,
    score_b AS goals_against,
    CASE
      WHEN score_a > score_b THEN 3
      WHEN score_a = score_b THEN 1
      ELSE 0
    END AS points
  FROM public.matches
  WHERE status = 'completed' OR status = 'forfeited'

  UNION ALL

  -- Team B stats
  SELECT
    team_b AS team_id,
    1 AS played,
    CASE WHEN score_b > score_a THEN 1 ELSE 0 END AS won,
    CASE WHEN score_b = score_a THEN 1 ELSE 0 END AS drawn,
    CASE WHEN score_b < score_a THEN 1 ELSE 0 END AS lost,
    score_b AS goals_for,
    score_a AS goals_against,
    CASE
      WHEN score_b > score_a THEN 3
      WHEN score_b = score_a THEN 1
      ELSE 0
    END AS points
  FROM public.matches
  WHERE status = 'completed' OR status = 'forfeited'
)
SELECT
  t.id AS team_id,
  t.name AS team_name,
  t.slug AS team_slug,
  t.captain_name,
  COALESCE(SUM(mr.played), 0)::INT AS played,
  COALESCE(SUM(mr.won), 0)::INT AS won,
  COALESCE(SUM(mr.drawn), 0)::INT AS drawn,
  COALESCE(SUM(mr.lost), 0)::INT AS lost,
  COALESCE(SUM(mr.goals_for), 0)::INT AS goals_for,
  COALESCE(SUM(mr.goals_against), 0)::INT AS goals_against,
  (COALESCE(SUM(mr.goals_for), 0) - COALESCE(SUM(mr.goals_against), 0))::INT AS goal_difference,
  COALESCE(SUM(mr.points), 0)::INT AS points
FROM public.teams t
LEFT JOIN match_results mr ON mr.team_id = t.id
WHERE t.status = 'approved'
GROUP BY t.id, t.name, t.slug, t.captain_name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;

-- ------------------------------------------------------------------------------
-- 9. ATOMIC SLOT BOOKING TRANSACTION FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_slot(p_slot_id UUID, p_team_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_capacity INT;
  v_booked_count INT;
  v_booking_id UUID;
  v_status TEXT;
BEGIN
  -- Lock the slot row to prevent concurrent race condition
  SELECT capacity INTO v_capacity
  FROM public.slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  -- Count confirmed + reserved spots
  SELECT COUNT(*) INTO v_booked_count
  FROM public.bookings
  WHERE slot_id = p_slot_id AND status IN ('reserved', 'confirmed');

  IF v_booked_count < v_capacity THEN
    v_status := 'reserved';
  ELSE
    v_status := 'waitlisted';
  END IF;

  INSERT INTO public.bookings (slot_id, team_id, status)
  VALUES (p_slot_id, p_team_id, v_status)
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'status', v_status
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public teams read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public team members read" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public slots read" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Public matches read" ON public.matches FOR SELECT USING (true);

-- Team registration policy (allow anyone to submit new team & members)
CREATE POLICY "Allow public team creation" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public pilot insertion" ON public.team_members FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin manage teams" ON public.teams FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage slots" ON public.slots FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage matches" ON public.matches FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage bookings" ON public.bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage payments" ON public.payments FOR ALL USING (public.is_admin());
