
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Target, TrendingUp, Zap } from "lucide-react";
import { StatsGrid } from "@/components/StatsGrid";
import { FeatureCard } from "@/components/FeatureCard";
import { HeroSection } from "@/components/HeroSection";

const Index = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Statistical Analysis",
      description: "Advanced algorithms analyze historical NBA data to identify value propositions"
    },
    {
      icon: Target,
      title: "Prop Optimization",
      description: "Pinpoint the highest probability props based on player performance trends"
    },
    {
      icon: TrendingUp,
      title: "Real-time Updates",
      description: "Live data integration ensures you're always working with current information"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get prop recommendations in seconds, not hours of manual research"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <HeroSection />
        
        <StatsGrid />
        
        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Why Choose Our Analysis
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Leverage cutting-edge statistical models to make informed decisions on NBA props
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <CardTitle className="text-lg">Data Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We aggregate NBA player stats, team performance, and PrizePicks prop data
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <CardTitle className="text-lg">Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our algorithms analyze patterns, trends, and probabilities to identify value
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <CardTitle className="text-lg">Best Props Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get ranked recommendations with confidence scores and reasoning
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold">
                Ready to Start Winning?
              </CardTitle>
              <CardDescription className="text-blue-100">
                Join thousands of users who trust our statistical analysis for NBA props
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-sm text-blue-100">
                  No credit card required • Free analysis included
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
