
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { seedSampleData } from '@/utils/seedData';
import { Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SeedDataButton: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const queryClient = useQueryClient();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const success = await seedSampleData();
      if (success) {
        toast.success('Sample data seeded successfully!');
        // Invalidate queries to refetch the new data
        queryClient.invalidateQueries({ queryKey: ['props'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      } else {
        toast.error('Failed to seed sample data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Error occurred while seeding data');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedData} 
      disabled={isSeeding}
      variant="outline"
      size="sm"
    >
      {isSeeding ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Database className="mr-2 h-4 w-4" />
      )}
      {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
    </Button>
  );
};
