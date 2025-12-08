import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { HelpCircle, ExternalLink } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDocsPage = location.pathname === "/docs";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="h-6 w-px bg-border" />
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          Real-time Injective Analytics
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={isDocsPage ? "secondary" : "ghost"}
          size="sm"
          onClick={() => navigate("/docs")}
          className="gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Docs</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2"
        >
          <a href="https://injective.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Injective</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
