export type ToolStatus = "live" | "starter" | "planned";

export type Tool = {
  title: string;
  slug: string;
  category: string;
  description: string;
  status: ToolStatus;
};

export const tools: Tool[] = [
  {
    title: "LinkedIn Text Formatter",
    slug: "text-formatter",
    category: "Formatting and publishing",
    description: "Convert AI Markdown into copy-ready LinkedIn text with Unicode styles and clean lists.",
    status: "live",
  },
  {
    title: "LinkedIn Post Preview",
    slug: "post-preview",
    category: "Formatting and publishing",
    description: "Paste a draft and see how it will read inside a LinkedIn-style feed card.",
    status: "starter",
  },
  {
    title: "LinkedIn Character Counter",
    slug: "character-counter",
    category: "Formatting and publishing",
    description: "Check characters, words, lines, hashtags, mentions, and estimated read time.",
    status: "starter",
  },
  {
    title: "LinkedIn Post Generator",
    slug: "post-generator",
    category: "Writing helpers",
    description: "Shape raw notes into post structures for stories, lessons, launches, and opinions.",
    status: "starter",
  },
  {
    title: "LinkedIn Hook Generator",
    slug: "hook-generator",
    category: "Writing helpers",
    description: "Create opening lines tuned for curiosity, clarity, contrast, and practical value.",
    status: "starter",
  },
  {
    title: "LinkedIn Headline Generator",
    slug: "headline-generator",
    category: "Writing helpers",
    description: "Draft profile headlines that combine role, audience, proof, and point of view.",
    status: "starter",
  },
  {
    title: "LinkedIn Hashtag Generator",
    slug: "hashtag-generator",
    category: "Discovery helpers",
    description: "Turn post topics into a balanced set of niche, category, and broad hashtags.",
    status: "starter",
  },
  {
    title: "LinkedIn Carousel Generator",
    slug: "carousel-generator",
    category: "Media utilities",
    description: "Plan slide-by-slide carousel narratives from one topic or long-form post.",
    status: "planned",
  },
];

export const categories = Array.from(new Set(tools.map((tool) => tool.category)));

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
