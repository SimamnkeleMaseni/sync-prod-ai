import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListChecks, Mail, Plus, Trash2, Wand2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AiNotice, EmptyState, ErrorState, LoadingState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiErrorMessage, aiService } from "@/services/aiService";
import { uid, useStore } from "@/lib/store";
import type { PlanTask, Priority, TaskPlan, TaskStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "Turn goals into prioritized execution plans with owners, deadlines, dependencies and risks.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Turn any workplace goal into a realistic, prioritized plan.",
      },
    ],
  }),
  component: TasksPage,
});

const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: TaskStatus[] = ["Not started", "In progress", "Blocked", "Done"];

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
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

function TasksPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>(store.settings.defaultPriority);
  const [resources, setResources] = useState("");
  const [constraints, setConstraints] = useState("");
  const [team, setTeam] = useState("");
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [loading, setLoading] = useState<null | string>(null);
  const [error, setError] = useState("");
  const [lastMode, setLastMode] = useState<"plan" | "breakdown" | "prioritize" | "replan">("plan");

  useEffect(() => {
    const payload = store.consumeHandoff("tasks");
    if (!payload) return;
    if (payload["openId"]) {
      const p = store.plans.find((x) => x.id === payload["openId"]);
      if (p) {
        setGoal(p.goal);
        setDeadline(p.deadline);
        setPriority(p.priority);
        setPlan(p);
        return;
      }
    }
    setGoal(payload["goal"] ?? "");
    setContext(payload["context"] ?? "");
    setTeam(payload["team"] ?? "");
    if (payload["existingTasks"]) setConstraints(`Existing action items:\n${payload["existingTasks"]}`);
    toast.info("Meeting context brought over — generate a plan when ready.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: TaskPlan) => {
    setPlan(next);
    store.savePlan(next);
  };

  const run = async (mode: "plan" | "breakdown" | "prioritize" | "replan") => {
    if (!goal.trim()) {
      toast.error("Describe your goal first.");
      return;
    }
    setLastMode(mode);
    setError("");
    setLoading("Building your task plan...");
    try {
      const res = await aiService.createTaskPlan({
        goal,
        context,
        deadline,
        priority,
        resources,
        constraints,
        team,
        mode,
        existingTasks:
          plan?.tasks
            .map((t) => `${t.task} | ${t.priority} | ${t.owner} | ${t.deadline} | ${t.status}`)
            .join("\n") ?? "",
        model: store.settings.model,
      });
      const next: TaskPlan = {
        id: plan?.id ?? uid(),
        goal: res.goal || goal,
        successCriteria: res.successCriteria ?? [],
        recommendedPriority: (res.recommendedPriority as Priority) || priority,
        tasks: (res.tasks ?? []).map((t) => ({
          id: uid(),
          task: t.task,
          priority: (t.priority as Priority) || "Medium",
          owner: t.owner || "Unassigned",
          deadline: t.deadline || "No deadline",
          status: "Not started" as TaskStatus,
        })),
        dependencies: res.dependencies ?? [],
        timeline: res.timeline ?? [],
        risks: res.risks ?? [],
        nextBestAction: res.nextBestAction ?? "",
        deadline,
        priority,
        createdAt: new Date().toISOString(),
      };
      persist(next);
      store.logActivity("plan_created", "tasks", next.goal, next.id);
      toast.success("Plan ready");
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const updateTask = (id: string, patch: Partial<PlanTask>) => {
    if (!plan) return;
    persist({ ...plan, tasks: plan.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  };

  const addTask = () => {
    if (!plan) return;
    persist({
      ...plan,
      tasks: [
        ...plan.tasks,
        {
          id: uid(),
          task: "New task",
          priority: "Medium",
          owner: "Unassigned",
          deadline: "No deadline",
          status: "Not started",
        },
      ],
    });
  };

  const emailFromTask = (t: PlanTask) => {
    store.setHandoff({
      target: "email",
      payload: {
        recipient: t.owner !== "Unassigned" ? t.owner : team,
        purpose: `Status update on: ${t.task}`,
        context: `Goal: ${plan?.goal ?? goal}\nTask status: ${t.status}\nDeadline: ${t.deadline}`,
        keyPoints: `Task: ${t.task}\nOwner: ${t.owner}\nPriority: ${t.priority}\nStatus: ${t.status}`,
        callToAction: "Confirm progress and flag any blockers.",
      },
    });
    navigate({ to: "/email" });
  };

  const statusUpdate = () => {
    if (!plan) return;
    store.setHandoff({
      target: "email",
      payload: {
        recipient: team,
        purpose: `Status update on "${plan.goal}"`,
        context: `Success criteria:\n${plan.successCriteria.join("\n")}\n\nRisks:\n${plan.risks.join("\n")}`,
        keyPoints: plan.tasks
          .map((t) => `${t.task} — ${t.status} (${t.owner}, due ${t.deadline})`)
          .join("\n"),
        callToAction: plan.nextBestAction,
      },
    });
    navigate({ to: "/email" });
  };

  return (
    <AppShell title="AI Task Planner" description="Goals into realistic, prioritized execution plans">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">What do you need to accomplish?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Goal</Label>
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Launch the customer portal" />
            </div>
            <div className="space-y-1.5">
              <Label>Project description</Label>
              <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Available resources</Label>
              <Textarea value={resources} onChange={(e) => setResources(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Constraints</Label>
              <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Team members</Label>
              <Input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Comma separated" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => run("plan")} disabled={!!loading}>
                <Wand2 className="size-4" /> Generate Plan
              </Button>
              <Button variant="outline" onClick={() => run("breakdown")} disabled={!!loading}>
                Break Into Tasks
              </Button>
              <Button variant="outline" onClick={() => run("prioritize")} disabled={!!loading}>
                Prioritize
              </Button>
              <Button variant="outline" onClick={() => run("replan")} disabled={!!loading}>
                Replan
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setPlan(null);
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
            <CardTitle className="text-sm">Execution plan</CardTitle>
            {plan && <AiNotice compact />}
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <LoadingState label={loading} />
            ) : error ? (
              <ErrorState message={error} onRetry={() => run(lastMode)} />
            ) : !plan ? (
              <EmptyState
                icon={<ListChecks className="size-5" />}
                title="No plan yet"
                description="Tell us what you need to accomplish and we'll turn it into an actionable plan."
              />
            ) : (
              <>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Goal</p>
                  <p className="mt-1 text-sm font-medium">{plan.goal}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recommended priority: <span className="font-medium text-foreground">{plan.recommendedPriority}</span>
                  </p>
                </div>
                <List title="Success criteria" items={plan.successCriteria} />

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tasks
                    </h3>
                    <Button size="sm" variant="outline" onClick={addTask}>
                      <Plus className="size-4" /> Add task
                    </Button>
                  </div>
                  <div className="mt-2 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Task</th>
                          <th className="px-3 py-2 font-medium">Priority</th>
                          <th className="px-3 py-2 font-medium">Owner</th>
                          <th className="px-3 py-2 font-medium">Deadline</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {plan.tasks.map((t) => (
                          <tr key={t.id} className="border-t border-border align-top">
                            <td className="px-2 py-1.5">
                              <Input
                                value={t.task}
                                onChange={(e) => updateTask(t.id, { task: e.target.value })}
                                className="h-8 border-transparent bg-transparent px-1.5 shadow-none focus-visible:border-input"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Select
                                value={t.priority}
                                onValueChange={(v) => updateTask(t.id, { priority: v as Priority })}
                              >
                                <SelectTrigger className="h-8 w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRIORITIES.map((p) => (
                                    <SelectItem key={p} value={p}>
                                      {p}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                value={t.owner}
                                onChange={(e) => updateTask(t.id, { owner: e.target.value })}
                                className="h-8 w-[130px] border-transparent bg-transparent px-1.5 shadow-none focus-visible:border-input"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                value={t.deadline}
                                onChange={(e) => updateTask(t.id, { deadline: e.target.value })}
                                className="h-8 w-[130px] border-transparent bg-transparent px-1.5 shadow-none focus-visible:border-input"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Select
                                value={t.status}
                                onValueChange={(v) => updateTask(t.id, { status: v as TaskStatus })}
                              >
                                <SelectTrigger className="h-8 w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="whitespace-nowrap px-2 py-1.5 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => emailFromTask(t)}
                                title="Create email from task"
                              >
                                <Mail className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  persist({ ...plan, tasks: plan.tasks.filter((x) => x.id !== t.id) })
                                }
                                title="Delete task"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <List title="Dependencies" items={plan.dependencies} />
                <List title="Suggested timeline" items={plan.timeline} />
                <List title="Risks" items={plan.risks} />

                {plan.nextBestAction && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">Next best action</p>
                    <p className="mt-1 text-sm">{plan.nextBestAction}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button size="sm" onClick={statusUpdate}>
                    <Mail className="size-4" /> Generate Status Update
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        plan.tasks
                          .map((t) => `${t.task} | ${t.priority} | ${t.owner} | ${t.deadline} | ${t.status}`)
                          .join("\n"),
                      );
                      toast.success("Task list copied");
                    }}
                  >
                    Copy Tasks
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
