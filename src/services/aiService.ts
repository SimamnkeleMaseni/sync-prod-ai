import { generateEmail, summarizeMeeting, createTaskPlan } from "@/lib/ai.functions";

export interface EmailRequest {
  recipient: string;
  purpose: string;
  context: string;
  keyPoints: string;
  callToAction: string;
  tone: string;
  length: string;
  mode: "generate" | "improve" | "rewrite" | "shorter" | "professional";
  existingDraft: string;
  model?: string;
}

export interface MeetingRequest {
  title: string;
  date: string;
  participants: string;
  notes: string;
  style: string;
  focus: "full" | "actions" | "decisions";
  model?: string;
}

export interface PlanRequest {
  goal: string;
  context: string;
  deadline: string;
  priority: string;
  resources: string;
  constraints: string;
  team: string;
  mode: "plan" | "breakdown" | "prioritize" | "replan";
  existingTasks: string;
  model?: string;
}

/**
 * Single centralized AI service used by every feature.
 * Pages never talk to the AI provider directly.
 */
export const aiService = {
  generateEmail: (input: EmailRequest) => generateEmail({ data: input }),
  summarizeMeeting: (input: MeetingRequest) => summarizeMeeting({ data: input }),
  createTaskPlan: (input: PlanRequest) => createTaskPlan({ data: input }),
};

export function aiErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
