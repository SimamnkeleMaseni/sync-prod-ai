import { AlertTriangle, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <AlertTriangle className="size-6 text-destructive" />
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Sparkles className="size-5" />}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function AiNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] text-muted-foreground">AI-generated • Review before use</p>
    );
  }
  return (
    <div className="flex gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5">
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        AI-generated content may contain mistakes, omissions, or unintended bias. Review important
        information, names, dates, decisions, recipients, and business actions before relying on or
        sharing AI-generated content. Do not share confidential information you are not permitted to
        process.
      </p>
    </div>
  );
}
