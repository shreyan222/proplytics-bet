
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Trash2, User, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const AccountManagement: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const { profile, refetch } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUsernameChange = async () => {
    if (!user || !newUsername.trim()) return;
    
    setUsernameLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call the database function to update username
      const { data, error } = await supabase.rpc('update_username', {
        user_id: user.id,
        new_username: newUsername.trim()
      });
      
      if (error) {
        setError('Failed to update username: ' + error.message);
        return;
      }
      
      if (!data) {
        setError('Username is not available or you can only change your username once per month');
        return;
      }
      
      setSuccess('Username updated successfully!');
      setNewUsername('');
      refetch();
      
      toast({
        title: "Success",
        description: "Username updated successfully!",
      });
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!user || !newEmail.trim()) return;
    
    setEmailLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim()
      });
      
      if (error) {
        setError('Failed to update email: ' + error.message);
        return;
      }
      
      setSuccess('Email change initiated! Please check your new email for verification.');
      setNewEmail('');
      
      toast({
        title: "Email verification sent",
        description: "Please check your new email address for verification.",
      });
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    
    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }
      
      // Sign out the user
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      navigate('/landing');
    } catch (err) {
      setError('Failed to delete account');
      setDeleteLoading(false);
    }
  };

  const canChangeUsername = async () => {
    if (!user) return false;
    
    try {
      const { data } = await supabase.rpc('can_change_username', {
        user_id: user.id
      });
      return data;
    } catch {
      return false;
    }
  };

  const [usernameChangeAllowed, setUsernameChangeAllowed] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (user) {
      canChangeUsername().then(setUsernameChangeAllowed);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Username Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Change Username
          </CardTitle>
          <CardDescription>
            You can change your username once every 30 days. Current username: <strong>{profile?.username}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="newUsername">New Username</Label>
            <Input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              disabled={usernameChangeAllowed === false}
            />
            {usernameChangeAllowed === false && (
              <p className="text-sm text-muted-foreground">
                You can only change your username once per month
              </p>
            )}
          </div>
          
          <Button 
            onClick={handleUsernameChange}
            disabled={usernameLoading || !newUsername.trim() || usernameChangeAllowed === false}
            className="w-full"
          >
            {usernameLoading ? 'Updating...' : 'Update Username'}
          </Button>
        </CardContent>
      </Card>

      {/* Email Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email
          </CardTitle>
          <CardDescription>
            Changing your email will require verification of the new email address. Current email: <strong>{user?.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
            />
          </div>
          
          <Button 
            onClick={handleEmailChange}
            disabled={emailLoading || !newEmail.trim()}
            className="w-full"
          >
            {emailLoading ? 'Updating...' : 'Update Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccountDeletion}
                  disabled={deleteLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
