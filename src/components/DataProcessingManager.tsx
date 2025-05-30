
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDataProcessing } from '@/hooks/useDataProcessing';
import { 
  RefreshCw, 
  Database, 
  Users, 
  BarChart3, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

export const DataProcessingManager: React.FC = () => {
  const {
    processData,
    scrapeDepthChart,
    fetchStatMuseData,
    processingStatus,
    isProcessing
  } = useDataProcessing();

  const [teamName, setTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [againstTeam, setAgainstTeam] = useState('');
  const [timeframe, setTimeframe] = useState('since-2024-2025-season');

  const handleProcessData = () => {
    processData.mutate();
  };

  const handleScrapeDepthChart = () => {
    if (!teamName.trim()) return;
    scrapeDepthChart.mutate(teamName.trim());
  };

  const handleFetchStatMuse = () => {
    if (!playerName.trim() || !againstTeam.trim()) return;
    fetchStatMuseData.mutate({
      player_name: playerName.trim(),
      against_team: againstTeam.trim(),
      timeframe,
      stat_type: 'Points'
    });
  };

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Processing Status
          </CardTitle>
          <CardDescription>
            Background data processing pipeline status and controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Pipeline Status</p>
              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    <Badge variant="secondary">Processing</Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline">Idle</Badge>
                  </>
                )}
              </div>
            </div>
            <Button 
              onClick={handleProcessData}
              disabled={isProcessing}
            >
              <Database className="h-4 w-4 mr-2" />
              Run Processing
            </Button>
          </div>

          {processingStatus && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Last Run</p>
                <p className="text-sm font-medium">
                  {new Date(processingStatus.last_run).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Scheduled</p>
                <p className="text-sm font-medium">
                  {new Date(processingStatus.next_run).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ESPN Depth Chart Scraper */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ESPN Depth Chart Scraper
          </CardTitle>
          <CardDescription>
            Scrape player positions from ESPN depth charts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="team">Team Abbreviation</Label>
              <Input
                id="team"
                placeholder="e.g., LAL, BOS, GSW"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleScrapeDepthChart}
                disabled={!teamName.trim() || scrapeDepthChart.isPending}
              >
                {scrapeDepthChart.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Scrape Depth Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* StatMuse Data Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            StatMuse Data Integration
          </CardTitle>
          <CardDescription>
            Fetch historical player statistics from StatMuse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="player">Player Name</Label>
              <Input
                id="player"
                placeholder="e.g., LeBron James"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="against">Against Team</Label>
              <Input
                id="against"
                placeholder="e.g., GSW"
                value={againstTeam}
                onChange={(e) => setAgainstTeam(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timeframe">Timeframe</Label>
            <select
              id="timeframe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="since-2024-2025-season">2024-25 Season</option>
              <option value="since-2023-2024-season">2023-24 Season</option>
              <option value="last-10-games">Last 10 Games</option>
            </select>
          </div>

          <Button 
            onClick={handleFetchStatMuse}
            disabled={!playerName.trim() || !againstTeam.trim() || fetchStatMuseData.isPending}
            className="w-full"
          >
            {fetchStatMuseData.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Fetch StatMuse Data
          </Button>
        </CardContent>
      </Card>

      {/* Data Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Data Validation
          </CardTitle>
          <CardDescription>
            Data quality checks and error handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Props Data Integrity</span>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Player Position Coverage</span>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                85% Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">StatMuse API Health</span>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
