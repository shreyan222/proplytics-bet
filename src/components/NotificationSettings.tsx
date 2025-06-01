
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    newProps: true,
    removedProps: true,
    changedProps: true,
    favoritePlayersOnly: false,
    emailNotifications: false,
    browserNotifications: true,
    minScoreThreshold: 0.8,
    maxNotificationsPerHour: 10,
  });

  const handleSettingChange = (key: keyof typeof settings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to user preferences in the database
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Notification Types</CardTitle>
          <CardDescription className="text-gray-400">
            Choose which types of prop changes you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-props" className="flex flex-col space-y-1">
              <span className="text-white">New Props Available</span>
              <span className="text-sm font-normal text-gray-400">
                Get notified when new props become available
              </span>
            </Label>
            <Switch 
              id="new-props"
              checked={settings.newProps}
              onCheckedChange={(checked) => handleSettingChange('newProps', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="removed-props" className="flex flex-col space-y-1">
              <span className="text-white">Props Removed</span>
              <span className="text-sm font-normal text-gray-400">
                Get notified when props are no longer available
              </span>
            </Label>
            <Switch 
              id="removed-props"
              checked={settings.removedProps}
              onCheckedChange={(checked) => handleSettingChange('removedProps', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="changed-props" className="flex flex-col space-y-1">
              <span className="text-white">Props Changed</span>
              <span className="text-sm font-normal text-gray-400">
                Get notified when prop lines or odds change
              </span>
            </Label>
            <Switch 
              id="changed-props"
              checked={settings.changedProps}
              onCheckedChange={(checked) => handleSettingChange('changedProps', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="favorite-players" className="flex flex-col space-y-1">
              <span className="text-white">Favorite Players Only</span>
              <span className="text-sm font-normal text-gray-400">
                Only notify about players you've marked as favorites
              </span>
            </Label>
            <Switch 
              id="favorite-players"
              checked={settings.favoritePlayersOnly}
              onCheckedChange={(checked) => handleSettingChange('favoritePlayersOnly', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Delivery Methods</CardTitle>
          <CardDescription className="text-gray-400">
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="browser-notifications" className="flex flex-col space-y-1">
              <span className="text-white">Browser Notifications</span>
              <span className="text-sm font-normal text-gray-400">
                Show notifications in your browser
              </span>
            </Label>
            <Switch 
              id="browser-notifications"
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => handleSettingChange('browserNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span className="text-white">Email Notifications</span>
              <span className="text-sm font-normal text-gray-400">
                Send notifications to your email address
              </span>
            </Label>
            <Switch 
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Filters & Limits</CardTitle>
          <CardDescription className="text-gray-400">
            Set thresholds and limits for notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score-threshold" className="text-white">Minimum Score Threshold</Label>
            <Input
              id="score-threshold"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={settings.minScoreThreshold}
              onChange={(e) => handleSettingChange('minScoreThreshold', parseFloat(e.target.value))}
              className="text-white"
            />
            <p className="text-sm text-gray-400">
              Only notify about props with a sorting score above this threshold
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-notifications" className="text-white">Max Notifications Per Hour</Label>
            <Input
              id="max-notifications"
              type="number"
              min="1"
              max="100"
              value={settings.maxNotificationsPerHour}
              onChange={(e) => handleSettingChange('maxNotificationsPerHour', parseInt(e.target.value))}
              className="text-white"
            />
            <p className="text-sm text-gray-400">
              Limit the number of notifications you receive per hour
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};
