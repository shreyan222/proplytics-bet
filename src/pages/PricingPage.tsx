import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const features = [
  'Full props dashboard, tracker, and analytics',
  'Real-time data and matchup-based signals',
  'NBA & NFL coverage',
  'Ongoing updates as models and data improve',
];

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/4gM00j553evAdxpe563Je00';

export default function PricingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useSupabaseAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reason = params.get('reason');

  const startCheckout = async () => {
    setError(null);
    setCheckoutLoading(true);
    try {
      window.location.href = STRIPE_CHECKOUT_URL;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not start checkout';
      setError(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Pro subscription pricing"
        description="Subscribe to Proplytics Pro for full access to props analytics, live tools, and premium features."
        keywords="proplytics pro, subscription, props analytics"
      />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 text-muted-foreground"
            onClick={() => navigate('/landing')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src="/logo.png" alt="" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Proplytics Pro
              </span>
            </div>
            <p className="text-muted-foreground">
              Monthly subscription — cancel anytime in Stripe.
            </p>
          </div>

          {reason === 'subscription_required' && (
            <Alert className="mb-6">
              <AlertDescription>
                An active Pro subscription is required to use the app. Subscribe below,
                then sign in with the same email you use at checkout.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pro access</CardTitle>
              <CardDescription>
                Unlock after checkout — use the same email when you create your account or
                sign in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                disabled={checkoutLoading}
                onClick={startCheckout}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  'Subscribe with Stripe'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {user
                  ? 'You are signed in — your account will be linked when checkout completes.'
                  : 'After paying, go to Sign in and use your checkout email.'}
              </p>

              <div className="flex flex-col gap-2 text-center">
                <Button variant="link" className="text-sm" onClick={() => navigate('/auth')}>
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
