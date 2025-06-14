import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      try {
        // Try to query the table directly using a workaround for missing types
        const query = `
          SELECT id, job_type, status, started_at, completed_at, error_message, metadata, created_at
          FROM data_ingestion_jobs 
          ORDER BY created_at DESC 
          LIMIT 20
        `;
        
        const { data, error } = await supabase.rpc('sql', { query });
        
        if (error) {
          console.log('Direct query failed, returning empty data:', error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.log('Query error, returning empty data:', err);
        return [];
      }
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
