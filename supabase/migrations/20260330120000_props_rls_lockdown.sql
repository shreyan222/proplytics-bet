-- Lock down props tables so clients cannot bypass the paywall.
-- Data should be accessed via the `get-props` Edge Function (service role).

-- Enable RLS (idempotent).
alter table public.props enable row level security;
alter table public.prop_yday enable row level security;

-- Remove any existing permissive SELECT policies (if present).
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('props', 'prop_yday')
      and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end
$$;

-- Intentionally do not create a public SELECT policy.
-- The service role used by Edge Functions bypasses RLS by design.

