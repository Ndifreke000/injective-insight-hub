import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Blocks from "./pages/Blocks";
import Orderbook from "./pages/Orderbook";
import Trading from "./pages/Trading";
import Derivatives from "./pages/Derivatives";
import Risk from "./pages/Risk";
// CrossChain removed - no API for IBC data
import Heatmap from "./pages/Heatmap";
import Markets from "./pages/Markets";
import Compliance from "./pages/Compliance";
import Staking from "./pages/Staking";
// Transactions removed - no transaction stream API
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                <header className="sticky top-0 z-10 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center h-full px-4">
                    <SidebarTrigger />
                  </div>
                </header>
                <div className="p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/blocks" element={<Blocks />} />
                    <Route path="/orderbook" element={<Orderbook />} />
                    <Route path="/trading" element={<Trading />} />
                    <Route path="/derivatives" element={<Derivatives />} />
                    <Route path="/risk" element={<Risk />} />
                    {/* CrossChain route removed - no API for IBC data */}
                    <Route path="/heatmap" element={<Heatmap />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/compliance" element={<Compliance />} />

                    <Route path="/staking" element={<Staking />} />
                    {/* Transactions route removed - no transaction stream API */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
