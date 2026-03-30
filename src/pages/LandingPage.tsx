
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, BarChart3, Target, TrendingUp, Zap, ChartBar, Users, Clock, Shield, Flame, X, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SEO } from "@/components/SEO";

const LandingPage = () => {
  const navigate = useNavigate();
  const demoRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside and handle body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when mobile menu is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const features = [
    {
      icon: Clock,
      title: "Real-Time Prop Tracking",
      description: "Live updates on prop movements and line changes across PrizePicks"
    },
    {
      icon: ChartBar,
      title: "Matchup-Based Forecasting",
      description: "Advanced algorithms analyze head-to-head matchups for optimal prop selection"
    },
    {
      icon: TrendingUp,
      title: "Historical Trend Analysis",
      description: "Deep dive into player performance patterns and seasonal trends"
    },
    {
      icon: Users,
      title: "Custom Player Insights",
      description: "Personalized analytics based on your favorite players and teams"
    }
  ];

  const stats = [
    { label: "Props Analyzed", value: "50,000+", suffix: "" },
    { label: "Success Rate", value: "82%", suffix: "" },
    { label: "Active Users", value: "5,000+", suffix: "" },
    { label: "Data Points", value: "2M+", suffix: "" },
  ];

  const whyProplytics = [
    "Automated Data Pipeline",
    "Built for Prop Bettors",
    "Backtested Models",
    "Clean & Simple UI"
  ];

  // Scroll-driven animation for demo section
  const { scrollYProgress } = useScroll({
    target: demoRef,
    offset: ["start start", "end start"]
  });

  // Map scroll progress to vertical translation for slideshow
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

       return (
    <>
      <SEO 
        title="Prop Site Analytics, NFL Props, NBA Props"
        description="The ultimate prop site for NFL and NBA prop betting analytics. Discover advanced prop insights, real-time data, and winning strategies. Start winning more bets today!"
        keywords="prop site, NFL props, NBA props, prop betting, sports props, prop analytics, betting props, player props, game props, prop insights"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Proplytics - Prop Site Analytics",
          "description": "The ultimate prop site for NFL and NBA prop betting analytics with real-time data and winning strategies",
          "applicationCategory": "SportsApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "keywords": ["prop site", "NFL props", "NBA props", "prop betting", "sports analytics"]
        }}
      />
      <div className="min-h-screen bg-background">
       {/* Header Navigation */}
       <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
         <nav className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="Proplytics Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Proplytics
                </span>
              </div>
             
             <div className="hidden md:flex items-center gap-8">
               <a 
                 href="#features" 
                 className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                 onClick={(e) => {
                   e.preventDefault();
                   document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 Features
               </a>
               <a 
                 href="#demo" 
                 className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                 onClick={(e) => {
                   e.preventDefault();
                   document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 Demo
               </a>
               <a 
                 href="#why" 
                 className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                 onClick={(e) => {
                   e.preventDefault();
                   document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 Why Us
               </a>
               <button
                 type="button"
                 className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                 onClick={() => navigate('/pricing')}
               >
                 Pricing
               </button>
               <Button 
                 size="sm" 
                 variant="outline"
                 onClick={() => navigate('/pricing')}
                 className="border-primary/40"
               >
                 Get Pro
               </Button>
               <Button 
                 size="sm" 
                 onClick={() => navigate('/auth')}
                 className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
               >
                 Get Started
               </Button>
             </div>
             
             {/* Mobile menu button */}
             <div className="md:hidden mobile-menu-container">
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 className="relative z-50"
               >
                 {isMobileMenuOpen ? (
                   <X className="w-5 h-5" />
                 ) : (
                   <Menu className="w-5 h-5" />
                 )}
               </Button>
             </div>
           </div>
         </nav>
       </header>

       {/* Mobile Menu Dropdown */}
       {isMobileMenuOpen && (
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-lg mobile-menu-container"
         >
           <div className="container mx-auto px-4 py-6">
             <div className="flex flex-col space-y-4">
               <a 
                 href="#features" 
                 className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-2"
                 onClick={(e) => {
                   e.preventDefault();
                   setIsMobileMenuOpen(false);
                   document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 Features
               </a>
               <a 
                 href="#demo" 
                 className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-2"
                 onClick={(e) => {
                   e.preventDefault();
                   setIsMobileMenuOpen(false);
                   document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 Demo
               </a>
               <a 
                 href="#why" 
                 className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-2"
                 onClick={(e) => {
                   e.preventDefault();
                   setIsMobileMenuOpen(false);
                   document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 Why Us
               </a>
               <button
                 type="button"
                 className="text-left text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2 w-full"
                 onClick={() => {
                   setIsMobileMenuOpen(false);
                   navigate('/pricing');
                 }}
               >
                 Pricing
               </button>
               <div className="pt-4 border-t border-border/40 flex flex-col gap-2">
                 <Button 
                   size="lg" 
                   variant="outline"
                   className="w-full"
                   onClick={() => {
                     setIsMobileMenuOpen(false);
                     navigate('/pricing');
                   }}
                 >
                   Get Pro
                 </Button>
                 <Button 
                   size="lg" 
                   className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                   onClick={() => {
                     setIsMobileMenuOpen(false);
                     navigate('/auth');
                   }}
                 >
                   Get Started
                   <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               </div>
             </div>
           </div>
         </motion.div>
       )}

       {/* Hero Section */}
       <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-green-50"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              🚀 Powered by PrizePicks Data
            </Badge>
            
                                     <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Proplytics
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light">
              The Ultimate Prop Site for NFL Props, NBA Props & Betting Analytics
            </p>
            
                         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
               <Button 
                 size="lg" 
                 className="px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                 onClick={() => navigate('/pricing')}
               >
                 Get Pro
                 <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
               <Button 
                 size="lg" 
                 variant="outline" 
                 className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                 onClick={() => navigate('/auth')}
               >
                 Sign in
               </Button>
             </div>
          </div>
        </div>
      </section>

      

             {/* Key Features Section */}
       <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose Proplytics
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built by sports analytics experts, designed for serious prop bettors
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

             {/* Demo/Analytics Preview Section - Scroll-Driven Slideshow */}
       <section id="demo" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              See Proplytics in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Scroll down to explore our analytics platform features
            </p>
          </div>
          
          {/* Scroll-driven slideshow */}
          <div className="relative h-[200vh]"> 
            {/* Sticky container that stays pinned while scrolling */}
            <div 
              ref={demoRef} 
              className="sticky top-0 h-screen overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm border border-border/20"
            >
              <motion.div
                style={{ y }}
                className="flex flex-col h-[200%] w-full" // 2 images tall
              >
              {/* Slide 1 - Props Overview */}
              <div className="h-1/2 flex flex-col items-center justify-center p-8">
                <div className="max-w-4xl w-full">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      <h3 className="text-2xl font-bold text-foreground">Props Overview Dashboard</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Real-time prop data with advanced analytics, matchup scoring, and performance tracking
                    </p>
                  </div>
                  <div className="relative">
                    <img 
                      src="/props_table_pic.png" 
                      alt="Props Table - Advanced analytics dashboard showing player props with filtering and scoring" 
                      className="w-full h-auto rounded-xl border border-border/50 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent rounded-xl pointer-events-none" />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-muted-foreground">Green: Favorable Lines</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-muted-foreground">Blue: Standard Lines</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-muted-foreground">Red: Challenging Lines</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 - Hot Props Feature */}
              <div className="h-1/2 flex flex-col items-center justify-center p-8">
                <div className="max-w-4xl w-full">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Flame className="h-6 w-6 text-orange-500" />
                      <h3 className="text-2xl font-bold text-foreground">Hot Props - Performance Tracking</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Identify players on fire! See who's consistently outperforming their lines with L5 game analysis
                    </p>
                  </div>
                  <div className="relative">
                    <img 
                      src="/hotprops_pic.png" 
                      alt="Hot Props Table - Shows players performing well in last 5 games with fire emojis and highlighting" 
                      className="w-full h-auto rounded-xl border border-border/50 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent rounded-xl pointer-events-none" />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 justify-center">
                      <span className="text-2xl">🔥</span>
                      <span className="text-muted-foreground">Fire Emoji: Hot Streak</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-muted-foreground">Yellow: L5 Above Line</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-muted-foreground">Green: Goblin Props</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                      <Flame className="h-4 w-4" />
                      Hot Props Feature
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically highlights players whose last 5 game average significantly exceeds their prop line. 
                      Perfect for finding players in peak form!
                    </p>
                  </div>
                </div>
              </div>
              </motion.div>
              
              {/* Scroll Progress Indicator */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                <motion.div 
                  className="w-8 h-2 bg-primary/30 rounded-full overflow-hidden"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    style={{ 
                      width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Scroll Hint */}
              <div className="absolute top-6 right-6 text-sm text-muted-foreground bg-background/80 px-3 py-2 rounded-lg border border-border/30">
                <span className="animate-pulse">↓ Scroll to explore</span>
              </div>
            </div>
          </div>
          
          {/* Key Features Summary */}
          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 p-6">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Key Features You Can See
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Advanced Filtering</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Matchup Scoring</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Hot Props Tracking</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Performance Analytics</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
















                           {/* Why Proplytics Section */}
        <section id="why" className="py-20">
         <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto">
             <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
               <CardHeader className="text-center pb-8">
                 <CardTitle className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                   Built for Serious Prop Bettors
                 </CardTitle>
                 <CardDescription className="text-lg text-muted-foreground">
                   Every feature designed with one goal: help you make better prop decisions
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid md:grid-cols-2 gap-6">
                   {whyProplytics.map((point, index) => (
                     <div key={index} className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                         <Shield className="h-4 w-4 text-primary" />
                       </div>
                       <span className="text-lg font-medium text-foreground">{point}</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </section>

               {/* Pricing CTA Section */}
        <section id="pricing-preview" className="py-20 bg-muted/30">
         <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
               Proplytics Pro
             </h2>
             <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
               Full dashboard, analytics, and real-time prop tools — subscribe with Stripe, then sign in with the same email.
             </p>
           </div>
           
           <div className="max-w-4xl mx-auto">
             <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-green-50 via-background to-blue-50 relative overflow-hidden">
               <div className="absolute top-6 right-6">
                 <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold rounded-full">
                   Subscription
                 </Badge>
               </div>
               
               <CardHeader className="text-center pt-12 pb-8">
                 <CardTitle className="text-3xl md:text-4xl font-black text-foreground mb-4">
                   Premium access
                 </CardTitle>
                 <CardDescription className="text-xl font-medium text-muted-foreground">
                   Monthly plan • Cancel anytime in Stripe
                 </CardDescription>
               </CardHeader>
               
               <CardContent className="pb-12">
                 <div className="space-y-6 mb-8">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-lg text-foreground">Unlimited prop analysis & tracker</span>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-lg text-foreground">Real-time data updates</span>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-lg text-foreground">NBA & NFL coverage</span>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <span className="text-lg text-foreground">Secure checkout with Stripe</span>
                   </div>
                 </div>
                 
                 <div className="text-center">
                   <Button 
                     size="lg" 
                     className="px-12 py-4 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                     onClick={() => navigate('/pricing')}
                   >
                     View plans & subscribe
                     <ArrowRight className="ml-3 h-6 w-6" />
                   </Button>
                   <p className="text-sm text-muted-foreground mt-4">
                     Already subscribed? <button type="button" className="underline text-foreground" onClick={() => navigate('/auth')}>Sign in</button>
                   </p>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </section>

       {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Proplytics</h3>
              <p className="text-gray-300">
                Advanced sports prop analytics for smarter picks
              </p>
            </div>
            
            <Separator className="mb-8 bg-gray-700" />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-6 text-sm">

                <a href="#" className="hover:text-white transition-colors text-gray-300">Contact</a>
                <a href="#" className="hover:text-white transition-colors text-gray-300">Terms</a>
                <a href="#" className="hover:text-white transition-colors text-gray-300">Privacy</a>
              </div>
              <p className="text-sm text-gray-400">
                © 2024 Proplytics. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default LandingPage;
