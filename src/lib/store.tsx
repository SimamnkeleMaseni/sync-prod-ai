import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Activity,
  ActivityType,
  EmailDraft,
  Feature,
  Handoff,
  MeetingSummary,
  Settings,
  TaskPlan,
} from "./types";

const KEY = "awpa-state-v1";

export const defaultSettings: Settings = {
  model: "google/gemini-3.7-flash",
  defaultTone: "Professional",
  defaultSummaryStyle: "Executive Summary",
  defaultPriority: "Medium",
  theme: "light",
  notifyOnComplete: true,
};

interface AppState {
  emails: EmailDraft[];
  meetings: MeetingSummary[];
  plans: TaskPlan[];
  activity: Activity[];
  settings: Settings;
}

const emptyState: AppState = {
  emails: [],
  meetings: [],
  plans: [],
  activity: [],
  settings: defaultSettings,
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

interface StoreValue extends AppState {
  hydrated: boolean;
  saveEmail: (e: EmailDraft) => void;
  saveMeeting: (m: MeetingSummary) => void;
  savePlan: (p: TaskPlan) => void;
  updatePlan: (id: string, patch: Partial<TaskPlan>) => void;
  logActivity: (type: ActivityType, feature: Feature, title: string, referenceId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  handoff: Handoff | null;
  setHandoff: (h: Handoff | null) => void;
  consumeHandoff: (target: Handoff["target"]) => Record<string, string> | null;
  stats: { emails: number; meetings: number; plans: number; minutesSaved: number };
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [handoff, setHandoff] = useState<Handoff | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...emptyState, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore corrupted state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full */
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", state.settings.theme === "dark");
  }, [state.settings.theme, hydrated]);

  const logActivity = useCallback(
    (type: ActivityType, feature: Feature, title: string, referenceId: string) => {
      setState((s) => ({
        ...s,
        activity: [
          { id: uid(), type, feature, title, referenceId, createdAt: new Date().toISOString() },
          ...s.activity,
        ].slice(0, 100),
      }));
    },
    [],
  );

  const value = useMemo<StoreValue>(() => {
    const stats = {
      emails: state.emails.length,
      meetings: state.meetings.length,
      plans: state.plans.length,
      minutesSaved: state.emails.length * 8 + state.meetings.length * 25 + state.plans.length * 30,
    };
    return {
      ...state,
      hydrated,
      stats,
      handoff,
      setHandoff,
      logActivity,
      saveEmail: (e) =>
        setState((s) => ({ ...s, emails: [e, ...s.emails.filter((x) => x.id !== e.id)].slice(0, 50) })),
      saveMeeting: (m) =>
        setState((s) => ({
          ...s,
          meetings: [m, ...s.meetings.filter((x) => x.id !== m.id)].slice(0, 50),
        })),
      savePlan: (p) =>
        setState((s) => ({ ...s, plans: [p, ...s.plans.filter((x) => x.id !== p.id)].slice(0, 50) })),
      updatePlan: (id, patch) =>
        setState((s) => ({
          ...s,
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      consumeHandoff: (target) => {
        if (!handoff || handoff.target !== target) return null;
        const payload = handoff.payload;
        setHandoff(null);
        return payload;
      },
    };
  }, [state, hydrated, handoff, logActivity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `Today, ${time}` : `${d.toLocaleDateString()}, ${time}`;
}
