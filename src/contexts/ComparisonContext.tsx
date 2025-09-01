import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prop } from '@/types/nba';

interface ComparisonContextType {
  selectedProps: Prop[];
  addProp: (prop: Prop) => void;
  removeProp: (propId: string) => void;
  clearProps: () => void;
  setSelectedProps: (props: Prop[]) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [selectedProps, setSelectedProps] = useState<Prop[]>([]);

  // Load saved props from localStorage on mount
  useEffect(() => {
    const savedProps = localStorage.getItem('comparisonProps');
    if (savedProps) {
      try {
        const parsedProps = JSON.parse(savedProps);
        setSelectedProps(parsedProps);
      } catch (error) {
        console.error('Error parsing saved comparison props:', error);
        localStorage.removeItem('comparisonProps');
      }
    }
  }, []);

  // Save props to localStorage whenever they change
  useEffect(() => {
    if (selectedProps.length > 0) {
      localStorage.setItem('comparisonProps', JSON.stringify(selectedProps));
    } else {
      localStorage.removeItem('comparisonProps');
    }
  }, [selectedProps]);

  const addProp = (prop: Prop) => {
    if (selectedProps.length < 4 && !selectedProps.find(p => p.prop_id === prop.prop_id)) {
      setSelectedProps([...selectedProps, prop]);
    }
  };

  const removeProp = (propId: string) => {
    setSelectedProps(selectedProps.filter(p => p.prop_id !== propId));
  };

  const clearProps = () => {
    setSelectedProps([]);
  };

  const value: ComparisonContextType = {
    selectedProps,
    addProp,
    removeProp,
    clearProps,
    setSelectedProps,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
