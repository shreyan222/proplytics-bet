import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get('session_id');

  return (
    <>
      <SEO
        title="Checkout successful"
        description="Your Proplytics Pro subscription is processing. Sign in to continue."
        keywords="proplytics checkout success"
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment successful</CardTitle>
            <CardDescription>
              Your subscription is being activated. This usually takes a few seconds. Sign in
              with the same email you used at checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId && (
              <p className="text-xs text-muted-foreground break-all">Session: {sessionId}</p>
            )}
            <Button className="w-full" size="lg" onClick={() => navigate('/auth')}>
              Sign in
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/landing')}>
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
