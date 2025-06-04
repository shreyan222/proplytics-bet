
import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

import Index from "@/pages/Index"
import LandingPage from "@/pages/LandingPage"
import AuthPage from "@/pages/AuthPage"
import NotFound from "@/pages/NotFound"
import SettingsPage from "@/pages/SettingsPage"
import DataProcessingPage from "@/pages/DataProcessingPage"
import PropsTrackerPage from "@/pages/PropsTrackerPage"
import BestPropsPage from "@/pages/BestPropsPage"
import ComparePage from "@/pages/ComparePage"
import HotPropsPage from "@/pages/HotPropsPage"
import PlayersPage from "@/pages/PlayersPage"
import PlayerDetail from "@/pages/PlayerDetail"
import AnalyticsPage from "@/pages/AnalyticsPage"
import UsingProplyticsPage from "@/pages/UsingProplyticsPage"
import RecapPage from "@/pages/RecapPage"

import { AuthWrapper } from "@/components/AuthWrapper"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AuthWrapper><Index /></AuthWrapper>} />
            <Route path="/tracker" element={<AuthWrapper><PropsTrackerPage /></AuthWrapper>} />
            <Route path="/best-props" element={<AuthWrapper><BestPropsPage /></AuthWrapper>} />
            <Route path="/compare" element={<AuthWrapper><ComparePage /></AuthWrapper>} />
            <Route path="/hot-props" element={<AuthWrapper><HotPropsPage /></AuthWrapper>} />
            <Route path="/players" element={<AuthWrapper><PlayersPage /></AuthWrapper>} />
            <Route path="/players/:playerId" element={<AuthWrapper><PlayerDetail /></AuthWrapper>} />
            <Route path="/analytics" element={<AuthWrapper><AnalyticsPage /></AuthWrapper>} />
            <Route path="/recap" element={<AuthWrapper><RecapPage /></AuthWrapper>} />
            <Route path="/using-proplytics" element={<AuthWrapper><UsingProplyticsPage /></AuthWrapper>} />
            <Route path="/settings" element={<AuthWrapper><SettingsPage /></AuthWrapper>} />
            <Route path="/data-processing" element={<AuthWrapper><DataProcessingPage /></AuthWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
