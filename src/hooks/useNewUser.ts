
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useNewUser = () => {
  const { user } = useSupabaseAuth();
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if this is the user's first visit
      const hasVisitedBefore = localStorage.getItem(`proplytics_visited_${user.id}`);
      
      if (!hasVisitedBefore) {
        // Mark as visited and show modal
        localStorage.setItem(`proplytics_visited_${user.id}`, 'true');
        setShowNewUserModal(true);
      }
    }
  }, [user]);

  const closeNewUserModal = () => {
    setShowNewUserModal(false);
  };

  return {
    showNewUserModal,
    closeNewUserModal,
  };
};
