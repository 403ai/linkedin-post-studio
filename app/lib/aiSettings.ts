export type ProviderKey = "ollama" | "openai" | "anthropic" | "google" | "groq" | "mistral" | "openrouter";

export type ProviderSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type AiSettingsState = {
  activeProvider: ProviderKey;
  providers: Record<ProviderKey, ProviderSettings>;
};

export const AI_SETTINGS_STORAGE_KEY = "linkedin-post-studio-ai-settings";

export const providerMeta: {
  key: ProviderKey;
  name: string;
  description: string;
  defaultBaseUrl: string;
  defaultModel: string;
  needsApiKey: boolean;
}[] = [
  {
    key: "ollama",
    name: "Ollama",
    description: "Use a local model running on your machine.",
    defaultBaseUrl: "http://localhost:11434",
    defaultModel: "llama3.1",
    needsApiKey: false,
  },
  {
    key: "openai",
    name: "OpenAI",
    description: "Use your own OpenAI API key.",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4.1-mini",
    needsApiKey: true,
  },
  {
    key: "anthropic",
    name: "Anthropic",
    description: "Use your own Anthropic API key.",
    defaultBaseUrl: "https://api.anthropic.com",
    defaultModel: "claude-sonnet-4-5",
    needsApiKey: true,
  },
  {
    key: "google",
    name: "Google Gemini",
    description: "Use your own Google AI Studio key.",
    defaultBaseUrl: "https://generativelanguage.googleapis.com",
    defaultModel: "gemini-2.5-flash",
    needsApiKey: true,
  },
  {
    key: "groq",
    name: "Groq",
    description: "Use Groq-hosted open models.",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    needsApiKey: true,
  },
  {
    key: "mistral",
    name: "Mistral",
    description: "Use your own Mistral API key.",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-small-latest",
    needsApiKey: true,
  },
  {
    key: "openrouter",
    name: "OpenRouter",
    description: "Use one key for many compatible models.",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4.1-mini",
    needsApiKey: true,
  },
];

export function createDefaultAiSettings(): AiSettingsState {
  return {
    activeProvider: "ollama",
    providers: Object.fromEntries(
      providerMeta.map((provider) => [
        provider.key,
        {
          apiKey: "",
          baseUrl: provider.defaultBaseUrl,
          model: provider.defaultModel,
        },
      ]),
    ) as Record<ProviderKey, ProviderSettings>,
  };
}
