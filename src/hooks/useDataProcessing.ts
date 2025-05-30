
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useDataProcessing = () => {
  const { toast } = useToast();

  // Manual data processing trigger
  const processData = useMutation({
    mutationFn: async () => {
      console.log('Triggering data processing...');
      const { data, error } = await supabase.functions.invoke('data-processor');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Data Processing Completed',
        description: `Successfully processed ${data.processed_count} props`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Data Processing Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ESPN depth chart scraping
  const scrapeDepthChart = useMutation({
    mutationFn: async (team: string) => {
      console.log(`Scraping depth chart for team: ${team}`);
      const { data, error } = await supabase.functions.invoke('espn-scraper', {
        body: { team }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Depth Chart Updated',
        description: `Updated positions for ${data.players_count} players on ${data.team}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Depth Chart Scraping Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // StatMuse data fetching
  const fetchStatMuseData = useMutation({
    mutationFn: async (params: {
      player_name: string;
      against_team: string;
      timeframe: string;
      stat_type?: string;
    }) => {
      console.log('Fetching StatMuse data:', params);
      const { data, error } = await supabase.functions.invoke('statmuse-scraper', {
        body: params
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'StatMuse Data Retrieved',
        description: `Found ${data.stats.length} games for ${data.player_name}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'StatMuse Fetch Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get processing status
  const { data: processingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['processing-status'],
    queryFn: async () => {
      // This would typically check when the last processing run occurred
      // For now, we'll return a mock status
      return {
        last_run: new Date().toISOString(),
        status: 'idle',
        next_run: new Date(Date.now() + 7 * 60 * 1000).toISOString(), // 7 minutes from now
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  return {
    processData,
    scrapeDepthChart,
    fetchStatMuseData,
    processingStatus,
    statusLoading,
    isProcessing: processData.isPending,
  };
};
