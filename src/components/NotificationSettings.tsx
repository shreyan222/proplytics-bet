
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { preferences, isLoading, updatePreferences } = useUserPreferences();
  const { toast } = useToast();

  const handleSettingChange = async (setting: string, value: boolean) => {
    if (!preferences) return;

    const newSettings = {
      ...preferences.notification_settings,
      [setting]: value,
    };

    try {
      await updatePreferences.mutateAsync({
        notification_settings: newSettings,
      });
      
      toast({
        title: 'Settings Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const settings = preferences?.notification_settings || {
    new_props: true,
    removed_props: true,
    line_changes: true,
    odds_changes: true,
    favorite_players_only: false,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-props">New Props</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when new props are added
              </div>
            </div>
            <Switch
              id="new-props"
              checked={settings.new_props}
              onCheckedChange={(checked) => handleSettingChange('new_props', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="removed-props">Removed Props</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when props are removed
              </div>
            </div>
            <Switch
              id="removed-props"
              checked={settings.removed_props}
              onCheckedChange={(checked) => handleSettingChange('removed_props', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="line-changes">Line Changes</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when prop lines change
              </div>
            </div>
            <Switch
              id="line-changes"
              checked={settings.line_changes}
              onCheckedChange={(checked) => handleSettingChange('line_changes', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="odds-changes">Odds Changes</Label>
              <div className="text-sm text-muted-foreground">
                Get notified when odds categories change
              </div>
            </div>
            <Switch
              id="odds-changes"
              checked={settings.odds_changes}
              onCheckedChange={(checked) => handleSettingChange('odds_changes', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="favorite-only">Favorite Players Only</Label>
              <div className="text-sm text-muted-foreground">
                Only get notifications for your favorite players
              </div>
            </div>
            <Switch
              id="favorite-only"
              checked={settings.favorite_players_only}
              onCheckedChange={(checked) => handleSettingChange('favorite_players_only', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
