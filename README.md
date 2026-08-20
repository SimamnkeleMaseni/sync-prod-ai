# AI Workplace Productivity Assistant

A unified SaaS web app that combines three workplace AI tools into one shell: a Smart Email Generator, a Meeting Notes Summarizer, and an AI Task Planner.

## Features

- **Smart Email Generator** — draft, improve, rewrite, shorten or professionalize emails with tone and length controls.
- **Meeting Notes Summarizer** — turn raw notes into an executive summary, key points, decisions, action items, risks and open questions.
- **AI Task Planner** — break a goal into prioritized tasks with owners, deadlines, dependencies, timeline and risks.
- **Cross-feature handoffs** — send a meeting summary straight into the Task Planner, or turn a decision or task into a follow-up email with the form pre-filled.
- **Activity history** — every generation is logged; click an entry to reopen the result.
- **Settings** — choose the AI model and default tone, summary style, priority and theme.
- **Local persistence** — drafts, summaries, plans, activity and settings are stored in the browser via `localStorage`.

## Tech stack

- TanStack Start (React 19, file-based routing, server functions)
- Vite 7 + TypeScript
- Tailwind CSS v4 with semantic design tokens
- shadcn/ui components, lucide-react icons
- Zod for input validation
- Lovable AI Gateway (`google/gemini-3.7-flash` by default)

## Architecture

```text
src/
  routes/            file-based pages (index, email, meetings, tasks, activity, settings)
  components/app/    shared shell, output editor, loading/error/empty states
  services/          aiService — the only entry point pages use for AI
  lib/
    ai.functions.ts  server functions (validated with Zod)
    ai.server.ts     single gateway client + friendly error mapping
    store.tsx        global state, persistence, cross-feature handoffs
    types.ts         shared domain types
```

All AI calls run server-side; the API key is never exposed to the browser. Every AI response is returned as strict JSON and rendered into editable, copyable output.

## Development

```sh
npm install
npm run dev
```

The app runs at `http://localhost:8080`.

## Responsible AI

Prompts instruct the model not to invent facts, to preserve dates, names, numbers and commitments, to flag assumptions, and to mark unknown owners as "Unassigned". AI output is a draft — review before sending.
