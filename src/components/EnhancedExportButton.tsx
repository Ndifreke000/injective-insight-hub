import { Button } from "@/components/ui/button";
import { Download, Database, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToJSON } from "@/lib/export";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface EnhancedExportButtonProps {
  data: any;
  filename: string;
  exportType: string;
  label?: string;
}

export function EnhancedExportButton({ 
  data, 
  filename, 
  exportType,
  label = "Export" 
}: EnhancedExportButtonProps) {
  const [saving, setSaving] = useState(false);

  const saveToDatabase = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('data_exports')
        .insert({
          export_type: exportType,
          data: Array.isArray(data) ? data : [data],
          metadata: { 
            filename, 
            exported_at: new Date().toISOString(),
            record_count: Array.isArray(data) ? data.length : 1
          }
        });

      if (error) throw error;
      toast.success("Data saved to database successfully!");
    } catch (error) {
      console.error("Error saving to database:", error);
      toast.error("Failed to save data to database");
    } finally {
      setSaving(false);
    }
  };

  const downloadFromDatabase = async () => {
    try {
      const { data: exports, error } = await supabase
        .from('data_exports')
        .select('*')
        .eq('export_type', exportType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!exports) {
        toast.error("No saved data found. Save data first.");
        return;
      }

      // Export the saved data as CSV
      const savedData = exports.data as any[];
      exportToCSV(savedData, `${filename}-saved`);
      toast.success("Downloaded saved data as CSV");
    } catch (error) {
      console.error("Error downloading from database:", error);
      toast.error("Failed to download saved data");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={saving}>
          <Download className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportToCSV(Array.isArray(data) ? data : [data], filename)}>
          <FileDown className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToJSON(data, filename)}>
          <FileDown className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={saveToDatabase}>
          <Database className="h-4 w-4 mr-2" />
          Save to Database
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadFromDatabase}>
          <Download className="h-4 w-4 mr-2" />
          Download Saved Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
