import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({ title, value, change, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden hover-lift",
      className
    )}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <span className="data-label">{title}</span>
          <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="metric-value">{value}</div>
        
        {change && (
          <p
            className={cn(
              "text-xs mt-2 flex items-center gap-1.5",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M6 2L10 7H2L6 2Z" fill="currentColor"/>
              </svg>
            )}
            {trend === "down" && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M6 10L2 5H10L6 10Z" fill="currentColor"/>
              </svg>
            )}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}