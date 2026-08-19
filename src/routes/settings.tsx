import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { AiNotice } from "@/components/app/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { Priority, SummaryStyle, Tone } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workplace AI Assistant" },
      {
        name: "description",
        content: "Configure your AI model, default tone, summary format, priority and theme.",
      },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Personalize how your AI workplace assistant works." },
    ],
  }),
  component: SettingsPage,
});

const MODELS = [
  { id: "google/gemini-3.7-flash", label: "Balanced (fast, recommended)" },
  { id: "google/gemini-3.6-flash", label: "Fast" },
  { id: "google/gemini-2.5-pro", label: "Highest quality (slower)" },
];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="w-full sm:w-64">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings } = useStore();

  const save = (patch: Parameters<typeof updateSettings>[0]) => {
    updateSettings(patch);
    toast.success("Settings saved");
  };

  return (
    <AppShell title="Settings" description="Defaults applied across every tool">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI preferences</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="AI model" hint="Used by every feature through the shared AI service.">
              <Select value={settings.model} onValueChange={(v) => save({ model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Default email tone">
              <Select
                value={settings.defaultTone}
                onValueChange={(v) => save({ defaultTone: v as Tone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Formal", "Concise", "Persuasive", "Apologetic"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Default summary format">
              <Select
                value={settings.defaultSummaryStyle}
                onValueChange={(v) => save({ defaultSummaryStyle: v as SummaryStyle })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Executive Summary", "Detailed Summary", "Decisions & Actions", "Concise Recap"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Default task priority">
              <Select
                value={settings.defaultPriority}
                onValueChange={(v) => save({ defaultPriority: v as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="Theme">
              <Select
                value={settings.theme}
                onValueChange={(v) => save({ theme: v as "light" | "dark" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Notify when generation finishes" hint="Shows a toast when the AI is done.">
              <div className="flex sm:justify-end">
                <Switch
                  checked={settings.notifyOnComplete}
                  onCheckedChange={(v) => save({ notifyOnComplete: v })}
                />
              </div>
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Responsible AI &amp; security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AiNotice />
            <p className="text-xs text-muted-foreground">
              AI credentials are stored and used server-side only — they are never exposed to the
              browser. Prompts instruct the model not to invent facts, to flag assumptions, and to
              leave owners and deadlines unassigned when they aren&apos;t stated.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
