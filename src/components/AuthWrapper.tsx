
import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, signIn, signUp, signOut } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      setError(null);
      
      try {
        console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} with email:`, email);
        
        const result = isSignUp 
          ? await signUp(email, password)
          : await signIn(email, password);
        
        console.log('Auth result:', result);
        
        if (result.error) {
          console.error('Auth error:', result.error);
          setError(result.error.message);
        } else if (isSignUp && !result.data.user?.email_confirmed_at) {
          setError('Please check your email to confirm your account before signing in.');
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">NBA Props Analyzer</CardTitle>
            <CardDescription>
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
            
            {/* Debug info */}
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <p><strong>Debug info:</strong></p>
              <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}</p>
              <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">NBA Props Analyzer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
