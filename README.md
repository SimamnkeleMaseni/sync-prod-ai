# Workwise AI

Build a single modern, production-ready web application called:

AI Workplace Productivity Assistant

The goal is to combine three workplace AI productivity tools into ONE unified SaaS application:

1. Smart Email Generator

2. Meeting Notes Summarizer

3. AI Task Planner

Do NOT build them as three separate websites or disconnected projects. They must share the same application shell, navigation, design system, state management, AI service layer, and user experience.

==================================================

1. APPLICATION STRUCTURE

==================================================

Create a unified dashboard with:

- Left sidebar navigation

- Top navigation/header

- Main content/workspace area

- Responsive mobile navigation

- User/profile area

- AI status indicator

- Responsible AI notice

- Consistent design system across every feature

Sidebar navigation:

Dashboard

Email Generator

Meeting Summarizer

Task Planner

Recent Activity

Settings

The Dashboard should provide an overview of all three AI capabilities.

==================================================

2. DASHBOARD

==================================================

Create a professional SaaS dashboard.

Header:

"Good afternoon"

"Your AI workplace assistant is ready to help."

Show three primary feature cards:

Smart Email Generator

- Generate professional emails

- Rewrite and improve existing emails

- Adjust tone and length

Meeting Notes Summarizer

- Summarize meeting notes

- Extract decisions

- Extract action items

- Identify risks and open questions

AI Task Planner

- Turn goals into actionable plans

- Prioritize tasks

- Create suggested deadlines

- Identify dependencies

Also include:

- Recent activity

- Recently generated emails

- Recent meeting summaries

- Recent task plans

- Quick action buttons

- Productivity statistics

Example statistics:

Emails generated

Meetings summarized

Tasks planned

Time saved

==================================================

3. SMART EMAIL GENERATOR

==================================================

Create a dedicated Email Generator page.

Inputs:

Recipient

Email purpose

Context / background

Key points

Tone

Length

Call to action

Tone options:

Professional

Friendly

Formal

Concise

Persuasive

Apologetic

Length options:

Short

Medium

Detailed

Include buttons:

Generate Email

Improve Draft

Rewrite

Make Shorter

Make More Professional

Copy

Clear

The AI output must appear in an editable rich-text/text area.

Output should include:

Subject

Greeting

Email body

Closing

Allow the user to edit the generated result before copying or using it.

Use a structured AI prompt internally:

ROLE:

You are a professional workplace communication assistant.

TASK:

Generate a clear, professional email based on the user's instructions.

CONTEXT:

{context}

RECIPIENT:

{recipient}

PURPOSE:

{purpose}

KEY POINTS:

{key_points}

TONE:

{tone}

LENGTH:

{length}

REQUIREMENTS:

- Do not invent facts.

- Preserve important dates, names, numbers, and commitments.

- Use professional workplace language.

- Keep the message concise and actionable.

- Clearly identify requested actions.

==================================================

4. MEETING NOTES SUMMARIZER

==================================================

Create a dedicated Meeting Summarizer page.

Inputs:

Meeting title

Meeting date

Participants

Meeting notes / transcript

Allow users to paste long meeting notes.

Provide summary style options:

Executive Summary

Detailed Summary

Decisions & Actions

Concise Recap

AI should extract:

Executive Summary

Key Discussion Points

Decisions

Action Items

Owners

Deadlines

Risks / Blockers

Open Questions

Action items should be displayed in a structured table:

Task | Owner | Deadline | Priority

Include buttons:

Summarize

Extract Action Items

Extract Decisions

Copy Summary

Clear

Use a structured AI prompt:

ROLE:

You are an expert meeting intelligence assistant.

TASK:

Analyze the meeting notes and create an accurate workplace summary.

MEETING:

{meeting_title}

DATE:

{meeting_date}

PARTICIPANTS:

{participants}

NOTES:

{meeting_notes}

REQUIREMENTS:

- Do not invent information.

- Do not assign owners unless explicitly stated.

- Do not create deadlines that are not present.

- Separate confirmed decisions from suggestions.

- Clearly identify unresolved questions.

- Preserve important facts and commitments.

OUTPUT:

1. Executive Summary

2. Key Discussion Points

3. Decisions

4. Action Items

5. Risks / Blockers

6. Open Questions

==================================================

5. AI TASK PLANNER

==================================================

Create a dedicated Task Planner page.

Inputs:

Goal

Project description

Deadline

Priority

Available resources

Constraints

Team members

AI should transform the goal into a structured execution plan.

Output:

Goal

Success Criteria

Recommended Priority

Task List

Dependencies

Suggested Timeline

Risks

Next Best Action

Task table:

Task | Priority | Owner | Deadline | Status

Allow users to:

- Add tasks

- Edit tasks

- Delete tasks

- Change priority

- Change status

- Assign owners

- Modify deadlines

- Mark tasks complete

Include:

Generate Plan

Break Into Tasks

Prioritize

Replan

Clear

Use a structured AI prompt:

ROLE:

You are an AI workplace project planning assistant.

GOAL:

{goal}

PROJECT CONTEXT:

{context}

DEADLINE:

{deadline}

PRIORITY:

{priority}

RESOURCES:

{resources}

CONSTRAINTS:

{constraints}

TEAM:

{team}

TASK:

Create a practical and realistic execution plan.

REQUIREMENTS:

- Break large objectives into manageable tasks.

- Identify dependencies.

- Prioritize tasks based on urgency and impact.

- Do not invent unavailable resources.

- Flag assumptions.

- Highlight risks.

- Keep deadlines realistic.

OUTPUT:

1. Goal

2. Success Criteria

3. Prioritized Tasks

4. Dependencies

5. Timeline

6. Risks

7. Recommended Next Action

==================================================

6. CROSS-FEATURE AI WORKFLOW

==================================================

The three tools must work together.

This is VERY IMPORTANT.

Do not treat them as isolated tools.

Allow information to flow between features.

Example workflow:

Meeting Notes

        ↓

Extract Action Items

        ↓

Send to Task Planner

        ↓

Create Project Tasks

        ↓

Generate Follow-up Email

Another workflow:

Task Planner

        ↓

Select Task

        ↓

Generate Email

        ↓

Send task update to stakeholder

Another workflow:

Meeting Summary

        ↓

Select Decision

        ↓

Generate Follow-up Email

Provide contextual buttons such as:

"Create Tasks from Meeting"

"Draft Follow-up Email"

"Add to Task Planner"

"Generate Status Update"

"Create Email from Task"

When the user moves information between tools, automatically pre-populate the destination form with the relevant context.

==================================================

7. SHARED AI SERVICE

==================================================

Create one centralized AI service layer.

Do NOT duplicate AI/API logic inside each page.

Create a reusable service such as:

aiService.generateEmail()

aiService.summarizeMeeting()

aiService.createTaskPlan()

The AI provider/API should be configurable through environment variables.

Never expose API keys in frontend code.

Use:

OPENAI_API_KEY

or another configurable AI provider.

Include proper loading states:

"Thinking..."

"Generating..."

"Analyzing notes..."

"Building your task plan..."

Handle errors gracefully.

Example:

"Something went wrong. Please try again."

Provide a retry button.

==================================================

8. SHARED DESIGN SYSTEM

==================================================

Use one consistent modern SaaS design language.

Style:

Clean

Professional

Minimal

Premium

Modern

Responsive

Use:

- White cards

- Light gray page background

- Subtle borders

- Soft shadows

- Rounded corners

- Professional typography

- Purple/indigo primary accent

- Clear visual hierarchy

- Generous spacing

Use reusable components:

Button

Card

Input

Textarea

Select

Modal

Toast

Badge

Sidebar

Header

EmptyState

LoadingState

ErrorState

OutputEditor

TaskTable

ActionItemTable

Do not duplicate components unnecessarily.

==================================================

9. RESPONSIVE DESIGN

==================================================

The application must work properly on:

Desktop

Laptop

Tablet

Mobile

Desktop:

Fixed sidebar + main workspace.

Tablet:

Collapsible sidebar.

Mobile:

Hamburger navigation

Stacked cards

Full-width forms

Scrollable tables

Touch-friendly buttons

Do not allow horizontal overflow.

==================================================

10. EDITABLE AI OUTPUTS

==================================================

Every AI-generated result must be editable.

Users should be able to:

Edit

Copy

Regenerate

Clear

Save

Do not force users to accept AI output as-is.

Show a subtle label:

"AI-generated • Review before use"

==================================================

11. RECENT ACTIVITY

==================================================

Create a shared activity system.

Track:

Email generated

Meeting summarized

Task plan created

Email regenerated

Meeting action items extracted

Tasks created from meeting

Display:

Activity type

Title

Timestamp

Feature

Example:

"Meeting summary created"

"Today, 14:32"

Clicking an activity should reopen the relevant result.

==================================================

12. RESPONSIBLE AI

==================================================

Include a Responsible AI disclaimer throughout the application.

Use wording such as:

"AI-generated content may contain mistakes, omissions, or unintended bias. Review important information, names, dates, decisions, recipients, and business actions before relying on or sharing AI-generated content."

Also include:

- Do not invent facts

- Clearly identify assumptions

- Protect confidential information

- Review AI-generated workplace decisions

- Allow users to edit all outputs

==================================================

13. SETTINGS

==================================================

Create a Settings page with:

AI model/provider

Default email tone

Default summary format

Default task priority

Theme

Notification preferences

API configuration should remain server-side and secure.

==================================================

14. DATA MODEL

==================================================

Use a clean shared data structure.

Example:

User

{

  id,

  name,

  email,

  preferences

}

EmailDraft

{

  id,

  recipient,

  subject,

  body,

  tone,

  createdAt,

  updatedAt

}

MeetingSummary

{

  id,

  title,

  date,

  participants,

  summary,

  decisions,

  actionItems,

  risks,

  createdAt

}

TaskPlan

{

  id,

  goal,

  tasks,

  deadline,

  priority,

  dependencies,

  risks,

  createdAt

}

Activity

{

  id,

  type,

  title,

  referenceId,

  createdAt

}

==================================================

15. UX REQUIREMENTS

==================================================

The user should always know:

- What tool they are using

- What information they need to provide

- What the AI is doing

- What was generated

- That the result is editable

- What they should review

Avoid unnecessary complexity.

Use progressive disclosure.

Show useful empty states.

Example:

"Paste your meeting notes to get started."

"Tell us what you need to accomplish and we'll turn it into an actionable plan."

==================================================

16. TECHNICAL REQUIREMENTS

==================================================

Build this as ONE project.

Use a modern frontend framework such as:

React + TypeScript

Use:

- Component-based architecture

- Reusable components

- Centralized AI service

- Shared state where appropriate

- Clean folder structure

- Environment variables

- API abstraction

- Error handling

- Loading states

- Form validation

Suggested structure:

src/

  components/

  pages/

    Dashboard/

    EmailGenerator/

    MeetingSummarizer/

    TaskPlanner/

    Activity/

    Settings/

  services/

    aiService.ts

  hooks/

  types/

  utils/

  layouts/

  styles/

Backend/API:

api/

  email/

  meeting/

  tasks/

Keep AI API keys on the server.

==================================================

17. IMPORTANT INTEGRATION RULE

==================================================

The application should feel like ONE product, not three projects placed next to each other.

Use:

- One navigation system

- One design system

- One authentication/session model

- One AI service layer

- One activity history

- One shared state/data layer

- Cross-feature actions

- Consistent terminology

- Consistent UI components

The three features should be deeply integrated.

==================================================

18. FINAL RESULT

==================================================

Deliver a polished SaaS application named:

AI Workplace Productivity Assistant

The final experience should feel comparable to a modern professional productivity SaaS platform.

Prioritize:

1. Excellent UX

2. Clean visual design

3. Strong integration between the three AI tools

4. Editable AI outputs

5. Reliable structured prompts

6. Responsive design

7. Responsible AI practices

8. Maintainable architecture

Do not create mockup-only screens.

Build functional interactions between all three tools and make the application ready to connect to a real AI backend.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sync-prod-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8acf94d0-77aa-44eb-9afe-2fb397b3bbd8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
