
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3 } from "lucide-react";

interface HeroSectionProps {
  onStartAnalyzing: () => void;
  onViewSample: () => void;
}

export const HeroSection = ({ onStartAnalyzing, onViewSample }: HeroSectionProps) => {
  return (
    <section className="text-center py-20">
      <div className="max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-6 text-sm font-medium">
          <BarChart3 className="w-3 h-3 mr-1" />
          NBA Statistical Analysis Platform
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Find the Best{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            NBA Props
          </span>{" "}
          with Data
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Leverage advanced statistical analysis to identify high-value NBA propositions 
          from PrizePicks. Make informed decisions backed by comprehensive data insights.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="font-semibold text-lg px-8 py-3" onClick={onStartAnalyzing}>
            Start Analyzing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="font-semibold text-lg px-8 py-3" onClick={onViewSample}>
            View Sample Analysis
          </Button>
        </div>
      </div>
    </section>
  );
};
