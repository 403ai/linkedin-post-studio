import { buildAssistPrompt, isAssistAction, type AssistActionKey } from "../../lib/assistPrompts";
import { providerMeta, type ProviderKey, type ProviderSettings } from "../../lib/aiSettings";

type AssistRequest = {
  action?: unknown;
  brief?: unknown;
  currentPost?: unknown;
  provider?: unknown;
  providerSettings?: Partial<ProviderSettings>;
  tone?: unknown;
};

type ChatMessage = {
  content: string;
  role: "system" | "user";
};

const openAiCompatibleProviders = new Set<ProviderKey>(["openai", "groq", "mistral", "openrouter"]);

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function normalizeBaseUrl(baseUrl: string, fallback: string) {
  return (baseUrl || fallback).replace(/\/+$/, "");
}

async function parseProviderError(response: Response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } | string; message?: string };
    if (typeof parsed.error === "string") {
      return parsed.error;
    }

    return parsed.error?.message || parsed.message || text;
  } catch {
    return text;
  }
}

async function callOpenAiCompatible(provider: ProviderKey, settings: ProviderSettings, messages: ChatMessage[]) {
  const meta = providerMeta.find((item) => item.key === provider);
  const baseUrl = normalizeBaseUrl(settings.baseUrl, meta?.defaultBaseUrl ?? "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    body: JSON.stringify({
      messages,
      model: settings.model || meta?.defaultModel,
      temperature: 0.7,
    }),
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callAnthropic(settings: ProviderSettings, messages: ChatMessage[]) {
  const meta = providerMeta.find((item) => item.key === "anthropic");
  const baseUrl = normalizeBaseUrl(settings.baseUrl, meta?.defaultBaseUrl ?? "");
  const system = messages.find((message) => message.role === "system")?.content ?? "";
  const user = messages.find((message) => message.role === "user")?.content ?? "";
  const response = await fetch(`${baseUrl}/v1/messages`, {
    body: JSON.stringify({
      max_tokens: 1200,
      messages: [{ content: user, role: "user" }],
      model: settings.model || meta?.defaultModel,
      system,
      temperature: 0.7,
    }),
    headers: {
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = (await response.json()) as { content?: { text?: string; type?: string }[] };
  return data.content?.find((part) => part.type === "text")?.text?.trim() ?? "";
}

async function callGemini(settings: ProviderSettings, messages: ChatMessage[]) {
  const meta = providerMeta.find((item) => item.key === "google");
  const baseUrl = normalizeBaseUrl(settings.baseUrl, meta?.defaultBaseUrl ?? "");
  const model = settings.model || meta?.defaultModel;
  const modelPath = model?.startsWith("models/") ? model : `models/${model}`;
  const response = await fetch(`${baseUrl}/v1beta/${modelPath}:generateContent`, {
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: messages.find((message) => message.role === "user")?.content ?? "" }],
          role: "user",
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
      systemInstruction: {
        parts: [{ text: messages.find((message) => message.role === "system")?.content ?? "" }],
      },
    }),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": settings.apiKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
}

async function callOllama(settings: ProviderSettings, messages: ChatMessage[]) {
  const meta = providerMeta.find((item) => item.key === "ollama");
  const baseUrl = normalizeBaseUrl(settings.baseUrl, meta?.defaultBaseUrl ?? "");
  const response = await fetch(`${baseUrl}/api/chat`, {
    body: JSON.stringify({
      messages,
      model: settings.model || meta?.defaultModel,
      stream: false,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = (await response.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() ?? "";
}

async function generateWithProvider(provider: ProviderKey, settings: ProviderSettings, action: AssistActionKey, currentPost: string, brief: string, tone: string) {
  const meta = providerMeta.find((item) => item.key === provider);
  if (!meta) {
    throw new Error("Choose a supported AI provider in Settings.");
  }

  if (meta.needsApiKey && !settings.apiKey) {
    throw new Error(`Add a ${meta.name} API key in Settings before generating.`);
  }

  const prompt = buildAssistPrompt({ action, brief, currentPost, tone });
  const messages: ChatMessage[] = [
    { content: prompt.system, role: "system" },
    { content: prompt.user, role: "user" },
  ];

  if (provider === "ollama") {
    return callOllama(settings, messages);
  }

  if (provider === "anthropic") {
    return callAnthropic(settings, messages);
  }

  if (provider === "google") {
    return callGemini(settings, messages);
  }

  if (openAiCompatibleProviders.has(provider)) {
    return callOpenAiCompatible(provider, settings, messages);
  }

  throw new Error("This provider is not wired yet.");
}

export async function POST(request: Request) {
  let body: AssistRequest;

  try {
    body = (await request.json()) as AssistRequest;
  } catch {
    return jsonError("Send a valid JSON request.");
  }

  if (!isAssistAction(body.action)) {
    return jsonError("Choose a valid Assist action.");
  }

  if (typeof body.provider !== "string" || !providerMeta.some((item) => item.key === body.provider)) {
    return jsonError("Choose a valid AI provider in Settings.");
  }

  const provider = body.provider as ProviderKey;
  const settings = {
    apiKey: String(body.providerSettings?.apiKey ?? ""),
    baseUrl: String(body.providerSettings?.baseUrl ?? ""),
    model: String(body.providerSettings?.model ?? ""),
  };
  const currentPost = typeof body.currentPost === "string" ? body.currentPost : "";
  const brief = typeof body.brief === "string" ? body.brief : "";
  const tone = typeof body.tone === "string" ? body.tone : "clear";

  try {
    const output = await generateWithProvider(provider, settings, body.action, currentPost, brief, tone);
    if (!output) {
      return jsonError("The provider returned an empty response. Try a different model or prompt.", 502);
    }

    return Response.json({ output });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "AI generation failed.", 502);
  }
}
