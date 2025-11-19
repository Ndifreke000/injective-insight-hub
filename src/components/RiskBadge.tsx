import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <Badge
      className={cn(
        "font-semibold",
        level === "low" && "bg-success text-success-foreground",
        level === "medium" && "bg-warning text-warning-foreground",
        level === "high" && "bg-destructive text-destructive-foreground",
        className
      )}
    >
      {level.toUpperCase()}
    </Badge>
  );
}
