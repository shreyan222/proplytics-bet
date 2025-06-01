import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import { PropsTrackerPage } from "./pages/PropsTrackerPage";
import { BestPropsPage } from "./pages/BestPropsPage";
import { ComparePage } from "./pages/ComparePage";
import { PlayersPage } from "./pages/PlayersPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PlayerDetail } from "./pages/PlayerDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page - accessible but not linked from main app */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Main app with sidebar */}
          <Route path="/*" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-background text-foreground">
                <AppSidebar />
                <main className="flex-1 bg-background">
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/tracker" element={<PropsTrackerPage />} />
                    <Route path="/best-props" element={<BestPropsPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/players" element={<PlayersPage />} />
                    <Route path="/players/:id" element={<PlayerDetail />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
