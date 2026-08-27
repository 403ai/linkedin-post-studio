"use client";

import { useEffect, useMemo, useState } from "react";

type ProviderKey = "ollama" | "openai" | "anthropic" | "google" | "groq" | "mistral" | "openrouter";

type ProviderSettings = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

type AiSettingsState = {
  activeProvider: ProviderKey;
  providers: Record<ProviderKey, ProviderSettings>;
};

const STORAGE_KEY = "linkedin-post-studio-ai-settings";

const providerMeta: {
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

function createDefaultSettings(): AiSettingsState {
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

export function AiSettings() {
  const [settings, setSettings] = useState<AiSettingsState>(() => createDefaultSettings());
  const [savedLabel, setSavedLabel] = useState("");
  const activeMeta = useMemo(
    () => providerMeta.find((provider) => provider.key === settings.activeProvider) ?? providerMeta[0],
    [settings.activeProvider],
  );
  const activeSettings = settings.providers[settings.activeProvider];

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AiSettingsState;
      setSettings({
        ...createDefaultSettings(),
        ...parsed,
        providers: {
          ...createDefaultSettings().providers,
          ...parsed.providers,
        },
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function updateProviderSetting(field: keyof ProviderSettings, value: string) {
    setSettings((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [current.activeProvider]: {
          ...current.providers[current.activeProvider],
          [field]: value,
        },
      },
    }));
  }

  function saveSettings() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedLabel("Settings saved");
    window.setTimeout(() => setSavedLabel(""), 1800);
  }

  function resetSettings() {
    const defaults = createDefaultSettings();
    setSettings(defaults);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    setSavedLabel("Settings reset");
    window.setTimeout(() => setSavedLabel(""), 1800);
  }

  return (
    <div className="settings-layout">
      <section className="settings-provider-list" aria-label="AI providers">
        {providerMeta.map((provider) => (
          <button
            aria-pressed={settings.activeProvider === provider.key}
            className={settings.activeProvider === provider.key ? "settings-provider active" : "settings-provider"}
            key={provider.key}
            onClick={() => setSettings((current) => ({ ...current, activeProvider: provider.key }))}
            type="button"
          >
            <span>{provider.name}</span>
            <small>{provider.description}</small>
          </button>
        ))}
      </section>

      <section className="settings-panel" aria-label={`${activeMeta.name} settings`}>
        <div className="settings-panel-heading">
          <div>
            <p className="eyebrow">Active provider</p>
            <h2>{activeMeta.name}</h2>
          </div>
          <span className={activeMeta.needsApiKey ? "status-pill warning" : "status-pill safe"}>
            {activeMeta.needsApiKey ? "API key" : "Local"}
          </span>
        </div>

        <div className="settings-note">
          <strong>Stored in this browser only.</strong>
          <span>
            These settings are saved locally on your device. Do not use a shared browser for personal API keys.
          </span>
        </div>

        <label className="settings-field">
          <span>Base URL</span>
          <input
            onChange={(event) => updateProviderSetting("baseUrl", event.target.value)}
            placeholder={activeMeta.defaultBaseUrl}
            type="url"
            value={activeSettings.baseUrl}
          />
        </label>

        <label className="settings-field">
          <span>Model</span>
          <input
            onChange={(event) => updateProviderSetting("model", event.target.value)}
            placeholder={activeMeta.defaultModel}
            type="text"
            value={activeSettings.model}
          />
        </label>

        {activeMeta.needsApiKey && (
          <label className="settings-field">
            <span>API key</span>
            <input
              autoComplete="off"
              onChange={(event) => updateProviderSetting("apiKey", event.target.value)}
              placeholder="Paste your provider API key"
              type="password"
              value={activeSettings.apiKey}
            />
          </label>
        )}

        {!activeMeta.needsApiKey && (
          <div className="settings-note">
            <strong>Ollama setup</strong>
            <span>
              Start Ollama locally, pull a model, and keep the base URL pointed at your Ollama server.
            </span>
          </div>
        )}

        <div className="settings-actions">
          <button className="settings-save-button" onClick={saveSettings} type="button">
            Save settings
          </button>
          <button onClick={resetSettings} type="button">
            Reset
          </button>
          {savedLabel && <span className="paste-status">{savedLabel}</span>}
        </div>
      </section>
    </div>
  );
}
