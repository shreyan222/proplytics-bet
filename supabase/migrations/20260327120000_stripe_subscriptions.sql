-- Stripe subscription state synced via Edge Function webhook (service role).

CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  stripe_customer_id text NOT NULL UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'incomplete',
  current_period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stripe_subscriptions_customer_email_lower_idx
  ON public.stripe_subscriptions (lower(customer_email));

CREATE INDEX IF NOT EXISTS stripe_subscriptions_user_id_idx
  ON public.stripe_subscriptions (user_id);

ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read rows tied to their account id or their JWT email (pay-before-signup).
CREATE POLICY "stripe_subscriptions_select_own"
  ON public.stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      auth.jwt()->>'email' IS NOT NULL
      AND lower(trim(customer_email)) = lower(trim(auth.jwt()->>'email'))
    )
  );

-- Link Stripe rows to new profiles when email matches.
CREATE OR REPLACE FUNCTION public.link_stripe_subscription_user_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stripe_subscriptions
  SET user_id = NEW.id,
      updated_at = now()
  WHERE user_id IS NULL
    AND lower(trim(customer_email)) = lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_stripe_link ON public.profiles;
CREATE TRIGGER on_profile_created_stripe_link
  AFTER INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.link_stripe_subscription_user_from_profile();
