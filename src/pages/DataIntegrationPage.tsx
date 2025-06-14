
import React from 'react';
import { Button } from '@/components/ui/button';
import { DataIngestionStatus } from '@/components/DataIngestionStatus';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Code, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DataIntegrationPage: React.FC = () => {
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
            <h1 className="text-3xl font-bold">Data Integration Pipeline</h1>
            <p className="text-muted-foreground">
              Live data integration with Python scraping scripts
            </p>
          </div>
        </div>
        <Database className="h-8 w-8 text-primary" />
      </div>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Python Integration Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Step 1: Install the Supabase Uploader</h3>
            <p className="text-sm text-muted-foreground">
              Copy the <code className="bg-gray-100 px-1 rounded">supabase_uploader.py</code> file to your data_scraper&analyzer directory.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Step 2: Update Your Main Script</h3>
            <p className="text-sm text-muted-foreground">
              Replace your existing main script with <code className="bg-gray-100 px-1 rounded">enhanced_main.py</code> or integrate the SupabaseUploader into your current workflow.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Step 3: Run the Enhanced Script</h3>
            <p className="text-sm text-muted-foreground">
              Execute <code className="bg-gray-100 px-1 rounded">python enhanced_main.py</code> to start the automated data pipeline.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Features Enabled:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automated data uploads every 7 minutes</li>
              <li>• Real-time prop change notifications</li>
              <li>• Error handling and retry logic</li>
              <li>• Performance monitoring and logging</li>
              <li>• Seamless integration with your existing algorithms</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Data Pipeline Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">1. Python Scraping</h3>
                <p className="text-sm text-muted-foreground">
                  Your existing scripts scrape PrizePicks, ESPN, and StatMuse data
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">2. Data Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms calculate scores, averages, and predictions
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">3. Live Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time synchronization with web app via Supabase
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-medium mb-2">Data Flow:</h4>
              <p className="text-sm text-muted-foreground">
                Python Scripts → Data Processing → Supabase Edge Function → Database → Real-time WebSocket → Frontend
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ingestion Status */}
      <DataIngestionStatus />
    </div>
  );
};
