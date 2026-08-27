export type AssistActionKey =
  | "generatePost"
  | "turnNotes"
  | "improvePost"
  | "shortenPost"
  | "professional"
  | "conversational"
  | "generateHooks"
  | "improveHook"
  | "hashtags"
  | "cta";

type PromptInput = {
  action: AssistActionKey;
  brief: string;
  currentPost: string;
  tone: string;
};

const actionInstructions: Record<AssistActionKey, string> = {
  generatePost:
    "Create a complete LinkedIn post from the user's idea. Use a strong first line, short paragraphs, practical insight, and a natural ending question.",
  turnNotes:
    "Turn rough notes or bullet points into a complete LinkedIn post. Preserve the user's core idea, organize it clearly, and make it readable.",
  improvePost:
    "Improve the current LinkedIn post for clarity, structure, flow, and usefulness. Preserve the point of view and avoid adding fake facts.",
  shortenPost:
    "Shorten the current LinkedIn post while preserving the core message. Remove repetition, filler, and weak transitions.",
  professional:
    "Rewrite the current LinkedIn post in a more professional tone. Keep it human, specific, and clear.",
  conversational:
    "Rewrite the current LinkedIn post in a warmer, more conversational tone. Make it sound like a real person wrote it.",
  generateHooks:
    "Generate 5 hook options for the current post or idea. Return only the hook options, one per line.",
  improveHook:
    "Improve the opening hook of the current post. Return 5 alternative first lines, one per line.",
  hashtags:
    "Suggest 5 to 8 LinkedIn hashtags based on the post. Mix broad, niche, and topic-specific tags. Return hashtags only.",
  cta:
    "Create 5 natural CTA options for the end of the post. Avoid salesy phrasing. Return one option per line.",
};

export function buildAssistPrompt({ action, brief, currentPost, tone }: PromptInput) {
  const normalizedTone = tone || "clear";
  const instruction = actionInstructions[action];

  return {
    system: [
      "You write practical LinkedIn posts for creators, founders, operators, and technical professionals.",
      "Return plain text only. Do not use Markdown headings. Do not wrap the answer in quotes.",
      "Use short paragraphs and LinkedIn-friendly spacing.",
      "Do not invent personal experience, credentials, metrics, clients, or named examples.",
      "Respect any Audience, Goal, Length, and Voice notes provided by the user.",
      "If the user asks for hashtags or hooks, return only those options.",
    ].join("\n"),
    user: [
      `Action: ${action}`,
      `Tone: ${normalizedTone}`,
      "",
      `Instruction: ${instruction}`,
      "",
      "User idea, notes, or direction:",
      brief.trim() || "(none provided)",
      "",
      "Current post:",
      currentPost.trim() || "(none provided)",
    ].join("\n"),
  };
}

export function isAssistAction(value: unknown): value is AssistActionKey {
  return typeof value === "string" && value in actionInstructions;
}
