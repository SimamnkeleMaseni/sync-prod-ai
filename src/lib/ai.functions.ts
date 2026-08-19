import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailInput = z.object({
  recipient: z.string().default(""),
  purpose: z.string().default(""),
  context: z.string().default(""),
  keyPoints: z.string().default(""),
  tone: z.string().default("Professional"),
  length: z.string().default("Medium"),
  callToAction: z.string().default(""),
  mode: z.enum(["generate", "improve", "rewrite", "shorter", "professional"]).default("generate"),
  existingDraft: z.string().default(""),
  model: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailInput.parse(d))
  .handler(async ({ data }) => {
    const { callAiJson, RESPONSIBLE_AI_RULES } = await import("./ai.server");

    const modeLine: Record<string, string> = {
      generate: "Generate a new email from the instructions below.",
      improve: "Improve the existing draft: clarity, structure, grammar. Keep all facts.",
      rewrite: "Rewrite the existing draft with fresh phrasing while preserving meaning and facts.",
      shorter: "Make the existing draft significantly shorter while keeping all key information.",
      professional: "Rewrite the existing draft to be more professional and polished.",
    };

    const prompt = `ROLE:
You are a professional workplace communication assistant.

TASK:
${modeLine[data.mode]}

CONTEXT:
${data.context || "(none provided)"}

RECIPIENT:
${data.recipient || "(unspecified)"}

PURPOSE:
${data.purpose || "(unspecified)"}

KEY POINTS:
${data.keyPoints || "(none provided)"}

CALL TO ACTION:
${data.callToAction || "(none provided)"}

TONE:
${data.tone}

LENGTH:
${data.length}

EXISTING DRAFT:
${data.existingDraft || "(none)"}

REQUIREMENTS:
- Do not invent facts.
- Preserve important dates, names, numbers, and commitments.
- Use professional workplace language.
- Keep the message concise and actionable.
- Clearly identify requested actions.
${RESPONSIBLE_AI_RULES}

OUTPUT JSON SCHEMA:
{"subject": string, "greeting": string, "body": string, "closing": string}`;

    return await callAiJson<{ subject: string; greeting: string; body: string; closing: string }>({
      system: "You are a precise workplace communication assistant that replies with strict JSON.",
      prompt,
      ...(data.model ? { model: data.model } : {}),
    });
  });

const meetingInput = z.object({
  title: z.string().default(""),
  date: z.string().default(""),
  participants: z.string().default(""),
  notes: z.string().min(1),
  style: z.string().default("Executive Summary"),
  focus: z.enum(["full", "actions", "decisions"]).default("full"),
  model: z.string().optional(),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => meetingInput.parse(d))
  .handler(async ({ data }) => {
    const { callAiJson, RESPONSIBLE_AI_RULES } = await import("./ai.server");

    const focusLine =
      data.focus === "actions"
        ? "Focus primarily on extracting action items; other sections may be brief."
        : data.focus === "decisions"
          ? "Focus primarily on extracting confirmed decisions; other sections may be brief."
          : "Produce every section fully.";

    const prompt = `ROLE:
You are an expert meeting intelligence assistant.

TASK:
Analyze the meeting notes and create an accurate workplace summary.
Summary style: ${data.style}. ${focusLine}

MEETING:
${data.title || "(untitled)"}

DATE:
${data.date || "(unspecified)"}

PARTICIPANTS:
${data.participants || "(unspecified)"}

NOTES:
${data.notes}

REQUIREMENTS:
- Do not invent information.
- Do not assign owners unless explicitly stated (use "Unassigned").
- Do not create deadlines that are not present (use "No deadline").
- Separate confirmed decisions from suggestions.
- Clearly identify unresolved questions.
- Preserve important facts and commitments.
${RESPONSIBLE_AI_RULES}

OUTPUT JSON SCHEMA:
{"summary": string, "keyPoints": string[], "decisions": string[],
 "actionItems": [{"task": string, "owner": string, "deadline": string, "priority": "Low"|"Medium"|"High"|"Critical"}],
 "risks": string[], "openQuestions": string[]}`;

    return await callAiJson<{
      summary: string;
      keyPoints: string[];
      decisions: string[];
      actionItems: { task: string; owner: string; deadline: string; priority: string }[];
      risks: string[];
      openQuestions: string[];
    }>({
      system: "You are a meeting intelligence assistant that replies with strict JSON.",
      prompt,
      ...(data.model ? { model: data.model } : {}),
    });
  });

const planInput = z.object({
  goal: z.string().min(1),
  context: z.string().default(""),
  deadline: z.string().default(""),
  priority: z.string().default("Medium"),
  resources: z.string().default(""),
  constraints: z.string().default(""),
  team: z.string().default(""),
  mode: z.enum(["plan", "breakdown", "prioritize", "replan"]).default("plan"),
  existingTasks: z.string().default(""),
  model: z.string().optional(),
});

export const createTaskPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => planInput.parse(d))
  .handler(async ({ data }) => {
    const { callAiJson, RESPONSIBLE_AI_RULES } = await import("./ai.server");

    const modeLine: Record<string, string> = {
      plan: "Create a practical and realistic execution plan.",
      breakdown: "Break the goal into a granular, manageable task list.",
      prioritize: "Re-prioritize and re-order the existing tasks by urgency and impact.",
      replan: "Replan around the existing tasks, adjusting sequencing, owners and deadlines.",
    };

    const prompt = `ROLE:
You are an AI workplace project planning assistant.

GOAL:
${data.goal}

PROJECT CONTEXT:
${data.context || "(none provided)"}

DEADLINE:
${data.deadline || "(unspecified)"}

PRIORITY:
${data.priority}

RESOURCES:
${data.resources || "(none provided)"}

CONSTRAINTS:
${data.constraints || "(none provided)"}

TEAM:
${data.team || "(unspecified)"}

EXISTING TASKS:
${data.existingTasks || "(none)"}

TASK:
${modeLine[data.mode]}

REQUIREMENTS:
- Break large objectives into manageable tasks.
- Identify dependencies.
- Prioritize tasks based on urgency and impact.
- Do not invent unavailable resources.
- Flag assumptions.
- Highlight risks.
- Keep deadlines realistic. Use "Unassigned" when no owner is known.
${RESPONSIBLE_AI_RULES}

OUTPUT JSON SCHEMA:
{"goal": string, "successCriteria": string[], "recommendedPriority": "Low"|"Medium"|"High"|"Critical",
 "tasks": [{"task": string, "priority": "Low"|"Medium"|"High"|"Critical", "owner": string, "deadline": string, "status": "Not started"}],
 "dependencies": string[], "timeline": string[], "risks": string[], "nextBestAction": string}`;

    return await callAiJson<{
      goal: string;
      successCriteria: string[];
      recommendedPriority: string;
      tasks: { task: string; priority: string; owner: string; deadline: string; status: string }[];
      dependencies: string[];
      timeline: string[];
      risks: string[];
      nextBestAction: string;
    }>({
      system: "You are a project planning assistant that replies with strict JSON.",
      prompt,
      ...(data.model ? { model: data.model } : {}),
    });
  });
