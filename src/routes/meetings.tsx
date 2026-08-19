import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NotebookPen, Wand2, ListChecks, Mail } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AiNotice, EmptyState, ErrorState, LoadingState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiErrorMessage, aiService } from "@/services/aiService";
import { uid, useStore } from "@/lib/store";
import type { MeetingSummary, Priority, SummaryStyle } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into an executive summary with decisions, action items, risks and open questions.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Summarize meetings and extract decisions and action items automatically.",
      },
    ],
  }),
  component: MeetingsPage,
});

const STYLES: SummaryStyle[] = [
  "Executive Summary",
  "Detailed Summary",
  "Decisions & Actions",
  "Concise Recap",
];

const priorityTone: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Medium: "bg-primary/10 text-primary",
  Low: "bg-muted text-muted-foreground",
};

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((i, idx) => (
          <li key={idx} className="flex gap-2 text-sm">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MeetingsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState<SummaryStyle>(store.settings.defaultSummaryStyle);
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState<null | string>(null);
  const [error, setError] = useState("");
  const [lastFocus, setLastFocus] = useState<"full" | "actions" | "decisions">("full");

  useEffect(() => {
    const payload = store.consumeHandoff("meeting");
    if (!payload) return;
    if (payload["openId"]) {
      const m = store.meetings.find((x) => x.id === payload["openId"]);
      if (m) {
        setTitle(m.title);
        setDate(m.date);
        setParticipants(m.participants);
        setResult(m);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (focus: "full" | "actions" | "decisions") => {
    if (!notes.trim()) {
      toast.error("Paste your meeting notes first.");
      return;
    }
    setLastFocus(focus);
    setError("");
    setLoading("Analyzing notes...");
    try {
      const res = await aiService.summarizeMeeting({
        title,
        date,
        participants,
        notes,
        style,
        focus,
        model: store.settings.model,
      });
      const summary: MeetingSummary = {
        id: uid(),
        title: title || "Untitled meeting",
        date,
        participants,
        summary: res.summary,
        keyPoints: res.keyPoints ?? [],
        decisions: res.decisions ?? [],
        actionItems: (res.actionItems ?? []).map((a) => ({
          task: a.task,
          owner: a.owner || "Unassigned",
          deadline: a.deadline || "No deadline",
          priority: (a.priority as Priority) || "Medium",
        })),
        risks: res.risks ?? [],
        openQuestions: res.openQuestions ?? [],
        createdAt: new Date().toISOString(),
      };
      setResult(summary);
      store.saveMeeting(summary);
      store.logActivity(
        focus === "actions" ? "meeting_actions_extracted" : "meeting_summarized",
        "meeting",
        summary.title,
        summary.id,
      );
      toast.success("Meeting analyzed");
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const summaryText = result
    ? [
        `Meeting: ${result.title}`,
        result.date ? `Date: ${result.date}` : "",
        result.participants ? `Participants: ${result.participants}` : "",
        "",
        "EXECUTIVE SUMMARY",
        result.summary,
        "",
        "DECISIONS",
        ...result.decisions.map((d) => `- ${d}`),
        "",
        "ACTION ITEMS",
        ...result.actionItems.map(
          (a) => `- ${a.task} | ${a.owner} | ${a.deadline} | ${a.priority}`,
        ),
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const createTasks = () => {
    if (!result) return;
    store.setHandoff({
      target: "tasks",
      payload: {
        goal: `Deliver the follow-ups from "${result.title}"`,
        context: `${result.summary}\n\nDecisions:\n${result.decisions.join("\n")}`,
        team: result.participants,
        existingTasks: result.actionItems
          .map((a) => `${a.task} | owner: ${a.owner} | due: ${a.deadline} | ${a.priority}`)
          .join("\n"),
      },
    });
    store.logActivity("tasks_from_meeting", "tasks", `Tasks from ${result.title}`, result.id);
    navigate({ to: "/tasks" });
  };

  const followUpEmail = (decision?: string) => {
    if (!result) return;
    store.setHandoff({
      target: "email",
      payload: {
        recipient: result.participants,
        purpose: decision
          ? `Follow up on the decision: ${decision}`
          : `Follow up on "${result.title}"`,
        context: `${result.summary}\n\nDecisions:\n${result.decisions.join("\n")}`,
        keyPoints: result.actionItems
          .map((a) => `${a.task} (owner: ${a.owner}, due: ${a.deadline})`)
          .join("\n"),
        callToAction: "Confirm ownership and deadlines for the action items.",
      },
    });
    navigate({ to: "/email" });
  };

  return (
    <AppShell title="Meeting Notes Summarizer" description="Summaries, decisions and action items">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Meeting details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meeting title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 planning sync" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Summary style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as SummaryStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Participants</Label>
              <Input
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Comma separated"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Meeting notes / transcript</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={12}
                placeholder="Paste your meeting notes to get started."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => run("full")} disabled={!!loading}>
                <Wand2 className="size-4" /> Summarize
              </Button>
              <Button variant="outline" onClick={() => run("actions")} disabled={!!loading}>
                Extract Action Items
              </Button>
              <Button variant="outline" onClick={() => run("decisions")} disabled={!!loading}>
                Extract Decisions
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setNotes("");
                  setResult(null);
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>
            <AiNotice />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm">Meeting intelligence</CardTitle>
            {result && <AiNotice compact />}
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <LoadingState label={loading} />
            ) : error ? (
              <ErrorState message={error} onRetry={() => run(lastFocus)} />
            ) : !result ? (
              <EmptyState
                icon={<NotebookPen className="size-5" />}
                title="Nothing summarized yet"
                description="Paste your meeting notes to get started. We'll separate decisions from suggestions and never invent owners or deadlines."
              />
            ) : (
              <>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Executive summary
                  </h3>
                  <Textarea
                    className="mt-2"
                    rows={5}
                    value={result.summary}
                    onChange={(e) => {
                      const next = { ...result, summary: e.target.value };
                      setResult(next);
                      store.saveMeeting(next);
                    }}
                  />
                </div>
                <Section title="Key discussion points" items={result.keyPoints} />
                <Section title="Decisions" items={result.decisions} />

                {result.actionItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Action items
                    </h3>
                    <div className="mt-2 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 font-medium">Task</th>
                            <th className="px-3 py-2 font-medium">Owner</th>
                            <th className="px-3 py-2 font-medium">Deadline</th>
                            <th className="px-3 py-2 font-medium">Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.actionItems.map((a, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-3 py-2">{a.task}</td>
                              <td className="px-3 py-2 text-muted-foreground">{a.owner}</td>
                              <td className="px-3 py-2 text-muted-foreground">{a.deadline}</td>
                              <td className="px-3 py-2">
                                <Badge className={priorityTone[a.priority] ?? priorityTone["Medium"]} variant="secondary">
                                  {a.priority}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Section title="Risks / blockers" items={result.risks} />
                <Section title="Open questions" items={result.openQuestions} />

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button size="sm" onClick={createTasks}>
                    <ListChecks className="size-4" /> Create Tasks from Meeting
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => followUpEmail()}>
                    <Mail className="size-4" /> Draft Follow-up Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(summaryText);
                      toast.success("Summary copied");
                    }}
                  >
                    Copy Summary
                  </Button>
                </div>

                {result.decisions.length > 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium">Turn a decision into an email</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.decisions.slice(0, 4).map((d, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="outline"
                          className="max-w-full"
                          onClick={() => followUpEmail(d)}
                        >
                          <span className="truncate">{d.slice(0, 48)}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
