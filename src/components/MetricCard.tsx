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
      "group relative overflow-hidden hover-lift border-border/50",
      className
    )}>
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
      
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <span className="data-label">{title}</span>
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="metric-value text-foreground">{value}</div>
        
        {change && (
          <p
            className={cn(
              "text-xs mt-2 flex items-center gap-1",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" && <span className="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-b-[5px] border-transparent border-b-success" />}
            {trend === "down" && <span className="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent border-t-destructive" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}