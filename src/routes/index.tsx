import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, ListChecks, Mail, NotebookPen, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AiNotice, EmptyState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWhen, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "One workspace for AI-drafted emails, meeting summaries and task plans — deeply integrated, always editable.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Emails, meeting summaries and task plans in one connected AI workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    points: [
      "Generate professional emails",
      "Rewrite and improve existing emails",
      "Adjust tone and length",
    ],
  },
  {
    to: "/meetings" as const,
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    points: [
      "Summarize meeting notes",
      "Extract decisions",
      "Extract action items",
      "Identify risks and open questions",
    ],
  },
  {
    to: "/tasks" as const,
    icon: ListChecks,
    title: "AI Task Planner",
    points: [
      "Turn goals into actionable plans",
      "Prioritize tasks",
      "Create suggested deadlines",
      "Identify dependencies",
    ],
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const { stats } = store;

  const openEmail = (id: string) => {
    store.setHandoff({ target: "email", payload: { openId: id } });
    navigate({ to: "/email" });
  };
  const openMeeting = (id: string) => {
    store.setHandoff({ target: "meeting", payload: { openId: id } });
    navigate({ to: "/meetings" });
  };
  const openPlan = (id: string) => {
    store.setHandoff({ target: "tasks", payload: { openId: id } });
    navigate({ to: "/tasks" });
  };

  return (
    <AppShell title="Dashboard" description="Overview of your AI workplace tools">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{greeting()}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your AI workplace assistant is ready to help.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate({ to: "/email" })}>
              <Mail className="size-4" /> Draft an email
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/meetings" })}>
              <NotebookPen className="size-4" /> Summarize a meeting
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/tasks" })}>
              <ListChecks className="size-4" /> Plan a goal
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Emails generated" value={stats.emails} />
          <Stat label="Meetings summarized" value={stats.meetings} />
          <Stat label="Tasks planned" value={stats.plans} />
          <Stat
            label="Time saved (est.)"
            value={
              stats.minutesSaved >= 60
                ? `${Math.round((stats.minutesSaved / 60) * 10) / 10}h`
                : `${stats.minutesSaved}m`
            }
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.to} className="flex flex-col">
              <CardHeader>
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-4.5" />
                </div>
                <CardTitle className="mt-3 text-sm">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <ul className="space-y-1.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" onClick={() => navigate({ to: f.to })}>
                  Open <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent emails</CardTitle>
            </CardHeader>
            <CardContent>
              {store.emails.length === 0 ? (
                <p className="text-xs text-muted-foreground">No drafts yet.</p>
              ) : (
                <ul className="space-y-2">
                  {store.emails.slice(0, 4).map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => openEmail(e.id)}
                        className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-accent"
                      >
                        <span className="block truncate text-sm">{e.subject || "Untitled"}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatWhen(e.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent meeting summaries</CardTitle>
            </CardHeader>
            <CardContent>
              {store.meetings.length === 0 ? (
                <p className="text-xs text-muted-foreground">No summaries yet.</p>
              ) : (
                <ul className="space-y-2">
                  {store.meetings.slice(0, 4).map((m) => (
                    <li key={m.id}>
                      <button
                        onClick={() => openMeeting(m.id)}
                        className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-accent"
                      >
                        <span className="block truncate text-sm">{m.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatWhen(m.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent task plans</CardTitle>
            </CardHeader>
            <CardContent>
              {store.plans.length === 0 ? (
                <p className="text-xs text-muted-foreground">No plans yet.</p>
              ) : (
                <ul className="space-y-2">
                  {store.plans.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => openPlan(p.id)}
                        className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-accent"
                      >
                        <span className="block truncate text-sm">{p.goal}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatWhen(p.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {store.activity.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="size-5" />}
                  title="Your workspace is ready"
                  description="Everything you generate across the three tools shows up here, and flows between them."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {store.activity.slice(0, 6).map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatWhen(a.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <AiNotice />
        </section>
      </div>
    </AppShell>
  );
}
