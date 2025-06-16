
import { useQuery } from '@tanstack/react-query';

interface DataIngestionJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export const useDataIngestionStatus = () => {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['data-ingestion-jobs'],
    queryFn: async (): Promise<DataIngestionJob[]> => {
      // Return empty array until data_ingestion_jobs table is properly set up
      // This prevents TypeScript errors while the table doesn't exist in the schema
      console.log('Data ingestion jobs table not yet available, returning empty data');
      return [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const latestJob = jobs[0];
  const recentJobs = jobs.slice(0, 10);
  
  const jobStats = {
    total: jobs.length,
    completed: jobs.filter(job => job.status === 'completed').length,
    failed: jobs.filter(job => job.status === 'failed').length,
    running: jobs.filter(job => job.status === 'running').length,
    pending: jobs.filter(job => job.status === 'pending').length,
  };

  const lastSuccessfulRun = jobs.find(job => job.status === 'completed');
  const lastFailedRun = jobs.find(job => job.status === 'failed');

  return {
    jobs,
    recentJobs,
    latestJob,
    jobStats,
    lastSuccessfulRun,
    lastFailedRun,
    isLoading,
    error,
  };
};
