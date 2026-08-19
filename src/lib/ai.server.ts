const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const DEFAULT_MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function friendlyMessage(status: number, raw: string) {
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status === 402)
    return raw || "AI credits are exhausted for this workspace. Add credits in Lovable to continue.";
  if (status === 403) return raw || "AI access is blocked by workspace policy.";
  if (status === 401) return "AI is not configured correctly (missing or invalid API key).";
  if (status >= 500) return "The AI service is temporarily unavailable. Please try again.";
  return raw || "Something went wrong. Please try again.";
}

/** Single shared entry point for every AI call in the app. */
export async function callAiJson<T>(opts: {
  system: string;
  prompt: string;
  model?: string;
}): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError(401, "AI is not configured (missing key).");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: opts.model || DEFAULT_MODEL,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    let raw = "";
    try {
      const j = (await res.json()) as { message?: string; title?: string; error?: { message?: string } };
      raw = j.message || j.title || j.error?.message || "";
    } catch {
      raw = "";
    }
    throw new AiError(res.status, friendlyMessage(res.status, raw));
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AiError(502, "The AI returned an unexpected response. Please try again.");
  }
}

export const RESPONSIBLE_AI_RULES = `
- Do not invent facts, names, dates, numbers, or commitments.
- Preserve important dates, names, numbers, and commitments exactly.
- Clearly flag assumptions instead of presenting them as fact.
- Never expose or restate confidential data beyond what the user provided.
- Return ONLY valid JSON matching the requested schema, with no markdown fences.`;
