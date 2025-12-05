import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider",
        level === "low" && "bg-success/15 text-success",
        level === "medium" && "bg-warning/15 text-warning",
        level === "high" && "bg-destructive/15 text-destructive",
        className
      )}
    >
      <span 
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          level === "low" && "bg-success",
          level === "medium" && "bg-warning",
          level === "high" && "bg-destructive"
        )} 
      />
      {level}
    </span>
  );
}