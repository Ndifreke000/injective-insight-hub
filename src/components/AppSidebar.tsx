import {
  LayoutDashboard,
  Box,
  BookOpen,
  TrendingUp,
  PieChart,
  AlertTriangle,
  ArrowRightLeft,
  Activity,
  Building2,
  Shield,

  Coins,
  Moon,
  Sun,
  Receipt
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  { title: "Transaction Monitoring", url: "/transactions", icon: Receipt },
  { title: "Orderbook & Liquidity", url: "/orderbook", icon: BookOpen },
  { title: "Trading Activity", url: "/trading", icon: TrendingUp },
  { title: "Derivatives", url: "/derivatives", icon: PieChart },
  { title: "Risk & Liquidations", url: "/risk", icon: AlertTriangle },
  // Cross-Chain removed - no API for IBC data
  { title: "Risk Heatmap", url: "/heatmap", icon: Activity },
  { title: "Exchange Markets", url: "/markets", icon: Building2 },
  { title: "Compliance", url: "/compliance", icon: Shield },

  { title: "Staking", url: "/staking", icon: Coins },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center p-4">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <img src="/injective-logo.png" alt="Injective" className="h-6 w-6 rounded" />
              <h2 className="text-lg font-bold text-sidebar-primary">Injective Intel</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
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
          <img src="/injective-logo.png" alt="Injective" className="h-6 w-6 rounded mx-auto" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
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
