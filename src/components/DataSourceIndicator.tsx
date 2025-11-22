import { Clock, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DataSourceIndicatorProps {
    lastUpdated?: Date;
    source?: string;
    isLoading?: boolean;
}

export function DataSourceIndicator({ lastUpdated, source, isLoading }: DataSourceIndicatorProps) {
    const timeString = lastUpdated
        ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '--:--:--';

    return (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Last Updated: {timeString}</span>
            </div>

            {source && (
                <div className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5" />
                    <span>{source}</span>
                </div>
            )}

            {!isLoading && lastUpdated && (
                <Badge variant="outline" className="text-success border-success/50">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
                    Live Data
                </Badge>
            )}

            {isLoading && (
                <Badge variant="outline" className="text-muted-foreground">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground mr-1.5 animate-pulse" />
                    Updating...
                </Badge>
            )}
        </div>
    );
}
