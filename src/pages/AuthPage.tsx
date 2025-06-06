
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, checkUsernameAvailability } = useSupabaseAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Check username availability when user types
  useEffect(() => {
    if (isSignUp && username.length >= 3) {
      const checkUsername = async () => {
        setUsernameStatus('checking');
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
      };

      const timeoutId = setTimeout(checkUsername, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameStatus('idle');
    }
  }, [username, isSignUp, checkUsernameAvailability]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} with email:`, email);
      
      let result;
      if (isSignUp) {
        if (usernameStatus !== 'available') {
          setError('Please choose an available username');
          setAuthLoading(false);
          return;
        }
        result = await signUp(email, password, username);
      } else {
        result = await signIn(email, password);
      }
      
      console.log('Auth result:', result);
      
      if (result.error) {
        console.error('Auth error:', result.error);
        setError(result.error.message);
      } else if (isSignUp && !result.data.user?.email_confirmed_at) {
        setError('Please check your email to confirm your account before signing in.');
      } else {
        // Successful auth will redirect via useEffect
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'taken':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getUsernameStatusMessage = () => {
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="final_logo.png" 
              alt="Proplytics Logo" 
              className="w-12 h-12"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              PROPLYTICS
            </span>
          </div>
          <p className="text-muted-foreground">
            Advanced Sports Props Analytics
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Sign up to access props analytics' : 'Sign in to your account'}
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
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Choose a unique username"
                      minLength={3}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getUsernameStatusIcon()}
                    </div>
                  </div>
                  {usernameStatus !== 'idle' && (
                    <p className={`text-sm ${
                      usernameStatus === 'available' ? 'text-green-600' :
                      usernameStatus === 'taken' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {getUsernameStatusMessage()}
                    </p>
                  )}
                </div>
              )}
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
              <Button 
                type="submit" 
                className="w-full" 
                disabled={authLoading || (isSignUp && usernameStatus !== 'available')}
              >
                {authLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setUsername('');
                  setUsernameStatus('idle');
                }}
                className="text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to landing page */}
        <div className="mt-4 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/landing')}
            className="text-sm text-muted-foreground"
          >
            ← Back to landing page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
