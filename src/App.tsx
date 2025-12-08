import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import Dashboard from "./pages/Dashboard";
import Blocks from "./pages/Blocks";
import Orderbook from "./pages/Orderbook";
import Trading from "./pages/Trading";
import Derivatives from "./pages/Derivatives";
import Risk from "./pages/Risk";
import Heatmap from "./pages/Heatmap";
import Markets from "./pages/Markets";
import Staking from "./pages/Staking";
import Docs from "./pages/Docs";
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
              <div className="flex-1 flex flex-col min-h-0">
                <AppHeader />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/blocks" element={<Blocks />} />
                    <Route path="/orderbook" element={<Orderbook />} />
                    <Route path="/trading" element={<Trading />} />
                    <Route path="/derivatives" element={<Derivatives />} />
                    <Route path="/risk" element={<Risk />} />
                    <Route path="/heatmap" element={<Heatmap />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/staking" element={<Staking />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
