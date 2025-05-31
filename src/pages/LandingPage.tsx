
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Target, TrendingUp, Zap } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { HeroSection } from "@/components/HeroSection";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

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

  const stats = [
    { label: "Props Analyzed", value: "10,000+", suffix: "" },
    { label: "Success Rate", value: "78%", suffix: "" },
    { label: "Active Users", value: "2,500+", suffix: "" },
    { label: "Data Points", value: "1M+", suffix: "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <HeroSection 
          onStartAnalyzing={() => navigate('/')} 
          onViewSample={() => navigate('/')} 
        />
        
        {/* Landing Page Stats */}
        <section className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-foreground">
                    {stat.value}
                    <span className="text-primary">{stat.suffix}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Our Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">1</span>
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
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold">
                Ready to Start Winning?
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Join thousands of users who trust our statistical analysis for NBA props
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="font-semibold"
                  onClick={() => navigate('/')}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-sm text-primary-foreground/70">
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

export default LandingPage;
