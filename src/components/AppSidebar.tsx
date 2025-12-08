import {
  LayoutDashboard,
  Box,
  BookOpen,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Activity,
  Building2,
  Coins,
  Moon,
  Sun,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Blocks & Transactions", url: "/blocks", icon: Box },
  { title: "Orderbook & Liquidity", url: "/orderbook", icon: BookOpen },
  { title: "Trading Activity", url: "/trading", icon: TrendingUp },
  { title: "Derivatives", url: "/derivatives", icon: PieChart },
  { title: "Risk & Liquidations", url: "/risk", icon: AlertTriangle },
  { title: "Risk Heatmap", url: "/heatmap", icon: Activity },
  { title: "Exchange Markets", url: "/markets", icon: Building2 },
  { title: "Staking", url: "/staking", icon: Coins },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className={`${isCollapsed ? "w-[52px]" : "w-60"} bg-sidebar-background border-r border-border`} 
      collapsible="icon"
    >
      <SidebarHeader className="h-16 flex items-center justify-center px-3 border-b border-border">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img src="/injective-logo.png" alt="Injective" className="h-8 w-8 rounded-lg object-contain" />
                <div className="absolute -bottom-0.5 -right-0.5 status-online" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-sidebar-foreground leading-tight">Injective</span>
                <span className="text-[9px] uppercase tracking-widest text-sidebar-muted">Intelligence</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 flex-shrink-0 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full">
            <img src="/injective-logo.png" alt="Injective" className="h-8 w-8 rounded-lg object-contain" />
            <div className="absolute bottom-0 right-2.5 status-online" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!isCollapsed && (
            <span className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-sidebar-muted">
              Analytics
            </span>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150"
                      activeClassName="nav-active"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="text-[13px]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}