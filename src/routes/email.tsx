import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Wand2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { OutputEditor } from "@/components/app/OutputEditor";
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
import { aiService, aiErrorMessage } from "@/services/aiService";
import { uid, useStore } from "@/lib/store";
import type { Length, Tone } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "Generate, rewrite and refine professional workplace emails with tone and length control.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Draft professional emails in seconds, then edit before sending.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES: Tone[] = [
  "Professional",
  "Friendly",
  "Formal",
  "Concise",
  "Persuasive",
  "Apologetic",
];
const LENGTHS: Length[] = ["Short", "Medium", "Detailed"];

type Mode = "generate" | "improve" | "rewrite" | "shorter" | "professional";

function EmailPage() {
  const store = useStore();
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [tone, setTone] = useState<Tone>(store.settings.defaultTone);
  const [length, setLength] = useState<Length>("Medium");
  const [output, setOutput] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState<null | string>(null);
  const [error, setError] = useState("");
  const [lastMode, setLastMode] = useState<Mode>("generate");

  useEffect(() => {
    const payload = store.consumeHandoff("email");
    if (!payload) return;
    if (payload["openId"]) {
      const draft = store.emails.find((e) => e.id === payload["openId"]);
      if (draft) {
        setRecipient(draft.recipient);
        setPurpose(draft.purpose);
        setTone(draft.tone);
        setLength(draft.length);
        setSubject(draft.subject);
        setOutput(draft.body);
        return;
      }
    }
    setRecipient(payload["recipient"] ?? "");
    setPurpose(payload["purpose"] ?? "");
    setContext(payload["context"] ?? "");
    setKeyPoints(payload["keyPoints"] ?? "");
    setCallToAction(payload["callToAction"] ?? "");
    toast.info("Context brought over — review and generate.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (mode: Mode) => {
    if (mode !== "generate" && !output.trim()) {
      toast.error("Generate or paste a draft first.");
      return;
    }
    if (mode === "generate" && !purpose.trim() && !keyPoints.trim()) {
      toast.error("Add a purpose or some key points first.");
      return;
    }
    setLastMode(mode);
    setError("");
    setLoading(
      mode === "generate" ? "Generating your email..." : "Thinking about how to improve it...",
    );
    try {
      const res = await aiService.generateEmail({
        recipient,
        purpose,
        context,
        keyPoints,
        callToAction,
        tone,
        length,
        mode,
        existingDraft: mode === "generate" ? "" : `${subject}\n\n${output}`,
        model: store.settings.model,
      });
      const body = [res.greeting, "", res.body, "", res.closing].filter(Boolean).join("\n");
      setSubject(res.subject);
      setOutput(body);
      const id = uid();
      const now = new Date().toISOString();
      store.saveEmail({
        id,
        recipient,
        purpose,
        subject: res.subject,
        body,
        tone,
        length,
        createdAt: now,
        updatedAt: now,
      });
      store.logActivity(
        mode === "generate" ? "email_generated" : "email_regenerated",
        "email",
        res.subject || "Email draft",
        id,
      );
      toast.success(mode === "generate" ? "Email generated" : "Draft updated");
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const clear = () => {
    setOutput("");
    setSubject("");
    setError("");
  };

  return (
    <AppShell
      title="Smart Email Generator"
      description="Draft, rewrite and polish workplace emails"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">What do you need to send?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Thabo, Head of Operations"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email purpose</Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Request approval for Q3 budget"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Context / background</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                placeholder="Anything the AI should know. Facts only — it will not invent details."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Key points</Label>
              <Textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={3}
                placeholder="One point per line"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Call to action</Label>
              <Input
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="e.g. Confirm approval by Friday"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => run("generate")} disabled={!!loading}>
                <Wand2 className="size-4" /> Generate Email
              </Button>
              <Button variant="outline" onClick={() => run("improve")} disabled={!!loading}>
                Improve Draft
              </Button>
              <Button variant="outline" onClick={() => run("rewrite")} disabled={!!loading}>
                Rewrite
              </Button>
              <Button variant="outline" onClick={() => run("shorter")} disabled={!!loading}>
                Make Shorter
              </Button>
              <Button variant="outline" onClick={() => run("professional")} disabled={!!loading}>
                Make More Professional
              </Button>
            </div>
            <AiNotice />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generated email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <LoadingState label={loading} />
            ) : error ? (
              <ErrorState message={error} onRetry={() => run(lastMode)} />
            ) : output ? (
              <>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <OutputEditor
                  value={output}
                  onChange={setOutput}
                  onRegenerate={() => run(lastMode)}
                  onClear={clear}
                  onSave={() => {
                    const now = new Date().toISOString();
                    store.saveEmail({
                      id: uid(),
                      recipient,
                      purpose,
                      subject,
                      body: output,
                      tone,
                      length,
                      createdAt: now,
                      updatedAt: now,
                    });
                    toast.success("Saved to your drafts");
                  }}
                />
              </>
            ) : (
              <EmptyState
                icon={<Mail className="size-5" />}
                title="No email yet"
                description="Tell us who it's for and what it's about — we'll draft it, and you can edit every word."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
