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
      className={isCollapsed ? "w-16" : "w-64"} 
      collapsible="icon"
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      <SidebarHeader className="border-b border-sidebar-border/50 h-16 flex items-center px-4">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/injective-logo.png" alt="Injective" className="h-8 w-8 rounded-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar-background" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-sidebar-foreground">Injective</h2>
                <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Intelligence</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
          <div className="relative mx-auto">
            <img src="/injective-logo.png" alt="Injective" className="h-8 w-8 rounded-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar-background" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {!isCollapsed && (
            <span className="px-3 mb-3 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
              Analytics
            </span>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
                      activeClassName="nav-active"
                    >
                      <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
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