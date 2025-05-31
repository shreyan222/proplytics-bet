
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import { PropsTrackerPage } from "./pages/PropsTrackerPage";
import { BestPropsPage } from "./pages/BestPropsPage";
import { PlayersPage } from "./pages/PlayersPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DataProcessingPage } from "./pages/DataProcessingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PlayerDetail } from "./pages/PlayerDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tracker" element={<PropsTrackerPage />} />
                <Route path="/best-props" element={<BestPropsPage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/players/:id" element={<PlayerDetail />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/data-processing" element={<DataProcessingPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
