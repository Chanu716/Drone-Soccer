-- ==============================================================================
-- Drone Soccer @ SRM AP — Migration 002: Admin Registration & Payment Module
-- Enhances teams and payments tables with verification, audit notes, and references
-- ==============================================================================

-- 1. Extend Teams Table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update Teams Status Check Constraint to allow 'cancelled'
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_status_check;
ALTER TABLE public.teams ADD CONSTRAINT teams_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- 2. Extend Payments Table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Update Payments Status Check Constraint to allow 'pending', 'verification_required'
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('created', 'pending', 'verification_required', 'paid', 'failed', 'refunded'));

-- Update Payments Method Check Constraint to allow 'upi', 'bank_transfer', 'other'
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check CHECK (method IN ('upi', 'razorpay', 'venue_upi', 'cash', 'bank_transfer', 'other'));

-- 3. Audit Log Table for Administrative Actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_label TEXT NOT NULL DEFAULT 'Admin',
  target_type TEXT NOT NULL, -- 'registration' or 'payment'
  target_id TEXT NOT NULL,
  target_label TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.admin_audit_logs(target_type, target_id);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role manage audit logs" ON public.admin_audit_logs FOR ALL USING (true);
