
 import React, { useEffect } from 'react';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { useNavigate } from 'react-router-dom';
 import { FloatingHelp } from './FloatingHelp';
 
 interface AuthWrapperProps {
   children: React.ReactNode;
 }
 
 export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
   const { user, loading } = useSupabaseAuth();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (!loading && !user) {
       navigate('/landing');
     }
   }, [user, loading, navigate]);
 
  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="text-center">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
           <p className="mt-4 text-muted-foreground">Loading...</p>
         </div>
       </div>
     );
   }
 
   if (!user) {
     // Will redirect via useEffect, show loading state
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="text-center">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
           <p className="mt-4 text-muted-foreground">Redirecting...</p>
         </div>
       </div>
     );
   }
 
   return (
     <>
       {children}
       <FloatingHelp />
     </>
   );
 };
