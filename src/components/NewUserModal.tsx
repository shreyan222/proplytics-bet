
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleGoToGuide = () => {
    onClose();
    navigate('/using-proplytics');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Welcome to Proplytics!</DialogTitle>
          <DialogDescription className="text-center">
            Get started with our comprehensive guide to maximize your success with our advanced props analytics platform.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleGoToGuide} className="w-full">
            View Getting Started Guide
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Explore on My Own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
