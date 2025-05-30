
import React from 'react';
import { Button } from '@/components/ui/button';
import { DataProcessingManager } from '@/components/DataProcessingManager';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database } from 'lucide-react';

export const DataProcessingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Data Processing Pipeline</h1>
            <p className="text-muted-foreground">
              Manage background data processing, ESPN scraping, and StatMuse integration
            </p>
          </div>
        </div>
        <Database className="h-8 w-8 text-primary" />
      </div>

      {/* Data Processing Manager */}
      <DataProcessingManager />
    </div>
  );
};
