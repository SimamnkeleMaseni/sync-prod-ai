export type Tone =
  | "Professional"
  | "Friendly"
  | "Formal"
  | "Concise"
  | "Persuasive"
  | "Apologetic";

export type Length = "Short" | "Medium" | "Detailed";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type TaskStatus = "Not started" | "In progress" | "Blocked" | "Done";

export type SummaryStyle =
  | "Executive Summary"
  | "Detailed Summary"
  | "Decisions & Actions"
  | "Concise Recap";

export interface EmailDraft {
  id: string;
  recipient: string;
  purpose: string;
  subject: string;
  body: string;
  tone: Tone;
  length: Length;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
  priority: Priority;
}

export interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  participants: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  risks: string[];
  openQuestions: string[];
  createdAt: string;
}

export interface PlanTask {
  id: string;
  task: string;
  priority: Priority;
  owner: string;
  deadline: string;
  status: TaskStatus;
}

export interface TaskPlan {
  id: string;
  goal: string;
  successCriteria: string[];
  recommendedPriority: Priority;
  tasks: PlanTask[];
  dependencies: string[];
  timeline: string[];
  risks: string[];
  nextBestAction: string;
  deadline: string;
  priority: Priority;
  createdAt: string;
}

export type ActivityType =
  | "email_generated"
  | "email_regenerated"
  | "meeting_summarized"
  | "meeting_actions_extracted"
  | "plan_created"
  | "tasks_from_meeting";

export type Feature = "email" | "meeting" | "tasks";

export interface Activity {
  id: string;
  type: ActivityType;
  feature: Feature;
  title: string;
  referenceId: string;
  createdAt: string;
}

export interface Settings {
  model: string;
  defaultTone: Tone;
  defaultSummaryStyle: SummaryStyle;
  defaultPriority: Priority;
  theme: "light" | "dark";
  notifyOnComplete: boolean;
}

/** Context handed from one tool to another (cross-feature workflow). */
export interface Handoff {
  target: "email" | "meeting" | "tasks";
  payload: Record<string, string>;
}
