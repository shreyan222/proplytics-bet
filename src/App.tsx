
import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ComparisonProvider } from "@/contexts/ComparisonContext"
import { FloatingComparisonIndicator } from "@/components/FloatingComparisonIndicator"
import { useComparisonTitle } from "@/hooks/useComparisonTitle"

import Index from "@/pages/Index"
import LandingPage from "@/pages/LandingPage"
import PricingPage from "@/pages/PricingPage"
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage"
import AuthPage from "@/pages/AuthPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import NotFound from "@/pages/NotFound"
import { SettingsPage } from "@/pages/SettingsPage"
import { DataProcessingPage } from "@/pages/DataProcessingPage"
import { PropsTrackerPage } from "@/pages/PropsTrackerPage"
import { BestPropsPage } from "@/pages/BestPropsPage"
import { ComparePage } from "@/pages/ComparePage"
import HotPropsPage from "@/pages/HotPropsPage"
import { PlayersPage } from "@/pages/PlayersPage"
import { PlayerDetail } from "@/pages/PlayerDetail"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import UsingProplyticsPage from "@/pages/UsingProplyticsPage"
import { RecapPage } from "@/pages/RecapPage"
import ResponsibleGamingPage from "@/pages/ResponsibleGamingPage"
import TermsOfUsePage from "@/pages/TermsOfUsePage"
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage"


import { AuthWrapper } from "@/components/AuthWrapper"
import { AppSidebar } from "@/components/AppSidebar"
import { Footer } from "@/components/Footer"
import { GlobalSearch } from "@/components/GlobalSearch"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  // Use the comparison title hook
  useComparisonTitle();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/*" element={
          <SidebarProvider>
            <div className="min-h-screen flex w-full flex-col">
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset className="flex-1 flex flex-col">
                  {/* Header with hamburger menu and search */}
                  <div className="sticky top-0 z-50 flex items-center gap-4 p-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                    <SidebarTrigger />
                    <GlobalSearch />
                    <div className="flex-1" />
                  </div>
                  <div className="flex-1">
                    <Routes>
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

                      <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
                      <Route path="/terms-of-use" element={<TermsOfUsePage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Footer />
                </SidebarInset>
              </div>
              {/* Floating comparison indicator */}
              <FloatingComparisonIndicator />
            </div>
          </SidebarProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ComparisonProvider>
            <Toaster />
            <AppContent />
            <Analytics />
            <SpeedInsights />
          </ComparisonProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
