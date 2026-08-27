"use client";

import { useMemo, useState } from "react";
import {
  AI_SETTINGS_STORAGE_KEY,
  createDefaultAiSettings,
  providerMeta,
  type AiSettingsState,
  type ProviderSettings,
} from "../lib/aiSettings";

function readStoredAiSettings() {
  const defaults = createDefaultAiSettings();

  if (typeof window === "undefined") {
    return defaults;
  }

  const stored = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
  if (!stored) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as AiSettingsState;
    return {
      ...defaults,
      ...parsed,
      providers: {
        ...defaults.providers,
        ...parsed.providers,
      },
    };
  } catch {
    window.localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    return defaults;
  }
}

export function AiSettings() {
  const [settings, setSettings] = useState(() => readStoredAiSettings());
  const [savedLabel, setSavedLabel] = useState("");
  const activeMeta = useMemo(
    () => providerMeta.find((provider) => provider.key === settings.activeProvider) ?? providerMeta[0],
    [settings.activeProvider],
  );
  const activeSettings = settings.providers[settings.activeProvider];

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
    window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setSavedLabel("Settings saved");
    window.setTimeout(() => setSavedLabel(""), 1800);
  }

  function resetSettings() {
    const defaults = createDefaultAiSettings();
    setSettings(defaults);
    window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(defaults));
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
            These settings are saved locally on your device. When you generate, the selected provider settings are sent to the app backend for that request.
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
              Start Ollama locally, pull a model, and keep the base URL pointed at your Ollama server. Ollama works best when the studio is also running locally.
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
