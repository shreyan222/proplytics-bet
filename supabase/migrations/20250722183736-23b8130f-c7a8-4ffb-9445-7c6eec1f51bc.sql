-- Enable replication for the props table so we can use realtime
ALTER TABLE props REPLICA IDENTITY FULL;

-- Add the props table to the supabase_realtime publication
BEGIN;
  -- Check if the table is already part of the publication
  DO $$
  DECLARE
      table_exists BOOLEAN;
  BEGIN
      SELECT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'props'
      ) INTO table_exists;
      
      IF NOT table_exists THEN
          -- Add the table to the publication
          EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.props';
      END IF;
  END
  $$;
COMMIT;