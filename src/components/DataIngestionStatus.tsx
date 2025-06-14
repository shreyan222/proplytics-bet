
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDataIngestionStatus } from '@/hooks/useDataIngestionStatus';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';

export const DataIngestionStatus: React.FC = () => {
  const { 
    latestJob, 
    recentJobs, 
    jobStats, 
    lastSuccessfulRun, 
    lastFailedRun, 
    isLoading 
  } = useDataIngestionStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Play className="h-4 w-4 text-blue-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateSuccessRate = () => {
    if (jobStats.total === 0) return 0;
    return Math.round((jobStats.completed / jobStats.total) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Ingestion Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{calculateSuccessRate()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{jobStats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-blue-600">{jobStats.running}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{jobStats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Job Status */}
      {latestJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Latest Ingestion Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(latestJob.status)}
                  <div>
                    <p className="font-medium">{latestJob.job_type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {formatDateTime(latestJob.started_at)}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusBadge(latestJob.status)}>
                  {latestJob.status.toUpperCase()}
                </Badge>
              </div>

              {latestJob.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>In Progress</span>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              )}

              {latestJob.completed_at && (
                <p className="text-sm text-muted-foreground">
                  Completed: {formatDateTime(latestJob.completed_at)}
                </p>
              )}

              {latestJob.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{latestJob.error_message}</p>
                </div>
              )}

              {latestJob.metadata && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-1">Metadata:</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(latestJob.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent jobs</p>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="text-sm font-medium">{job.job_type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(job.started_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusBadge(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Successful Run:</span>
              <span className="text-sm font-medium">
                {lastSuccessfulRun 
                  ? formatDateTime(lastSuccessfulRun.completed_at || lastSuccessfulRun.started_at)
                  : 'Never'
                }
              </span>
            </div>
            
            {lastFailedRun && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Failed Run:</span>
                <span className="text-sm font-medium text-red-600">
                  {formatDateTime(lastFailedRun.started_at)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm">System Status:</span>
              <Badge className={jobStats.running > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {jobStats.running > 0 ? 'Active' : 'Idle'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
