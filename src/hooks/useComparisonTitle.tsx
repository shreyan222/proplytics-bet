import { useEffect } from 'react';
import { useComparison } from '@/contexts/ComparisonContext';

export const useComparisonTitle = () => {
  const { selectedProps } = useComparison();

  useEffect(() => {
    const originalTitle = document.title;
    
    if (selectedProps.length > 0) {
      // Extract the base title (remove any existing comparison count)
      const baseTitle = originalTitle.replace(/ \(\d+\)/, '');
      document.title = `${baseTitle} (${selectedProps.length})`;
    } else {
      // Restore original title if no props are selected
      const baseTitle = originalTitle.replace(/ \(\d+\)/, '');
      document.title = baseTitle;
    }

    // Cleanup function to restore original title
    return () => {
      const currentTitle = document.title;
      const baseTitle = currentTitle.replace(/ \(\d+\)/, '');
      document.title = baseTitle;
    };
  }, [selectedProps.length]);
};
