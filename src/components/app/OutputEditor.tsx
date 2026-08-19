import { useState, type ReactNode } from "react";
import { Copy, Check, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AiNotice } from "./states";

export function OutputEditor({
  value,
  onChange,
  onRegenerate,
  onSave,
  onClear,
  rows = 16,
  extraActions,
}: {
  value: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  onClear?: () => void;
  rows?: number;
  extraActions?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select the text and copy manually.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <AiNotice compact />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="font-normal leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy
        </Button>
        {onRegenerate && (
          <Button size="sm" variant="outline" onClick={onRegenerate}>
            <RotateCcw className="size-4" /> Regenerate
          </Button>
        )}
        {onSave && (
          <Button size="sm" variant="outline" onClick={onSave}>
            <Save className="size-4" /> Save
          </Button>
        )}
        {onClear && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            <Trash2 className="size-4" /> Clear
          </Button>
        )}
        {extraActions}
      </div>
    </div>
  );
}
