
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpCircle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingHelp: React.FC = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleGoToGuide = () => {
    setIsHelpModalOpen(false);
    navigate('/using-proplytics');
  };

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setIsHelpModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 border-2 border-background"
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
        <span className="sr-only">Help</span>
      </Button>

      {/* Help Modal */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Need Help?</DialogTitle>
            <DialogDescription className="text-center">
              Visit our comprehensive guide to learn how to use Proplytics effectively and maximize your success.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={handleGoToGuide} className="w-full">
              View Using Proplytics Guide
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsHelpModalOpen(false)} 
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
