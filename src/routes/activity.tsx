import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { History, Mail, NotebookPen, ListChecks } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWhen, useStore } from "@/lib/store";
import type { Activity } from "@/lib/types";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Recent Activity — Workplace AI Assistant" },
      {
        name: "description",
        content: "Every email, meeting summary and task plan your AI assistant has produced.",
      },
      { property: "og:title", content: "Recent Activity" },
      {
        property: "og:description",
        content: "One shared history across all three AI productivity tools.",
      },
    ],
  }),
  component: ActivityPage,
});

const LABEL: Record<Activity["type"], string> = {
  email_generated: "Email generated",
  email_regenerated: "Email regenerated",
  meeting_summarized: "Meeting summary created",
  meeting_actions_extracted: "Meeting action items extracted",
  plan_created: "Task plan created",
  tasks_from_meeting: "Tasks created from meeting",
};

const ICON = { email: Mail, meeting: NotebookPen, tasks: ListChecks };

function ActivityPage() {
  const store = useStore();
  const navigate = useNavigate();

  const open = (a: Activity) => {
    const target = a.feature === "email" ? "email" : a.feature === "meeting" ? "meeting" : "tasks";
    store.setHandoff({ target, payload: { openId: a.referenceId } });
    navigate({ to: a.feature === "email" ? "/email" : a.feature === "meeting" ? "/meetings" : "/tasks" });
  };

  return (
    <AppShell title="Recent Activity" description="One shared history across all three tools">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Activity feed</CardTitle>
        </CardHeader>
        <CardContent>
          {store.activity.length === 0 ? (
            <EmptyState
              icon={<History className="size-5" />}
              title="No activity yet"
              description="Generate an email, summarize a meeting or build a task plan — it will show up here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {store.activity.map((a) => {
                const Icon = ICON[a.feature];
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => open(a)}
                      className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{LABEL[a.type]}</span>
                        <span className="block truncate text-xs text-muted-foreground">{a.title}</span>
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {formatWhen(a.createdAt)}
                      </span>
                      <Badge variant="secondary" className="hidden capitalize md:inline-flex">
                        {a.feature}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
