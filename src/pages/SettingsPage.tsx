
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationSettings } from '@/components/NotificationSettings';
import { FavoritePlayersManager } from '@/components/FavoritePlayersManager';
import { FilterPresetsManager } from '@/components/FilterPresetsManager';
import { AlertsManager } from '@/components/AlertsManager';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bell, Users, Filter, AlertTriangle } from 'lucide-react';
import { PropFilters } from '@/types/nba';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentFilters, setCurrentFilters] = useState<PropFilters>({});

  const handleApplyPreset = (filters: PropFilters) => {
    setCurrentFilters(filters);
    // In a real implementation, this would apply the filters to the main dashboard
    // For now, we'll just update the local state
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your preferences, alerts, and favorites
            </p>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Presets
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Custom Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <FavoritePlayersManager />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <FilterPresetsManager 
            currentFilters={currentFilters}
            onApplyPreset={handleApplyPreset}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
