
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="theme-toggle" className="flex items-center gap-2">
        {theme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span>Dark Mode</span>
        <span className="text-sm text-muted-foreground">
          {theme === 'dark' ? 'Enabled' : 'Disabled'}
        </span>
      </Label>
      <Switch 
        id="theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
      />
    </div>
  );
};
