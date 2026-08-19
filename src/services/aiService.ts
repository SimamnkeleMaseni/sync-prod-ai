import { generateEmail, summarizeMeeting, createTaskPlan } from "@/lib/ai.functions";

/**
 * Single centralized AI service used by every feature.
 * Pages never call the AI provider directly.
 */
export const aiService = {
  generateEmail: (input: Parameters<typeof generateEmail>[0] extends { data: infer D } ? D : never) =>
    generateEmail({ data: input }),
  summarizeMeeting: (
    input: Parameters<typeof summarizeMeeting>[0] extends { data: infer D } ? D : never,
  ) => summarizeMeeting({ data: input }),
  createTaskPlan: (
    input: Parameters<typeof createTaskPlan>[0] extends { data: infer D } ? D : never,
  ) => createTaskPlan({ data: input }),
};

export function aiErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
