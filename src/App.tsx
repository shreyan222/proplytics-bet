import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

import { Index } from "@/pages"
import { LandingPage } from "@/pages/LandingPage"
import { AuthPage } from "@/pages/AuthPage"
import { NotFound } from "@/pages/NotFound"
import { SettingsPage } from "@/pages/SettingsPage"
import { DataProcessingPage } from "@/pages/DataProcessingPage"
import { PropsTrackerPage } from "@/pages/PropsTrackerPage"
import { BestPropsPage } from "@/pages/BestPropsPage"
import { ComparePage } from "@/pages/ComparePage"
import { HotPropsPage } from "@/pages/HotPropsPage"
import { PlayersPage } from "@/pages/PlayersPage"
import { PlayerDetail } from "@/pages/PlayerDetail"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { UsingProplyticsPage } from "@/pages/UsingProplyticsPage"

import { AuthWrapper } from "@/components/AuthWrapper"

const queryClient = new QueryClient()
import RecapPage from "./pages/RecapPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<AuthWrapper />}>
              <Route path="/" element={<Index />} />
              <Route path="/tracker" element={<PropsTrackerPage />} />
              <Route path="/best-props" element={<BestPropsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/hot-props" element={<HotPropsPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:playerId" element={<PlayerDetail />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/recap" element={<RecapPage />} />
              <Route path="/using-proplytics" element={<UsingProplyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/data-processing" element={<DataProcessingPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
