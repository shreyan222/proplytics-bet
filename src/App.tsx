
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthWrapper } from "@/components/AuthWrapper";
import Index from "./pages/Index";
import { PlayersPage } from "./pages/PlayersPage";
import { PlayerDetail } from "./pages/PlayerDetail";
import { SettingsPage } from "./pages/SettingsPage";
import { DataProcessingPage } from "./pages/DataProcessingPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:playerId" element={<PlayerDetail />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/data-processing" element={<DataProcessingPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
