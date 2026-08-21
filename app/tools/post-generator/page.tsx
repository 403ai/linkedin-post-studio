import { StarterToolPage } from "../../components/StarterToolPage";

export default function PostGeneratorPage() {
  return (
    <StarterToolPage
      eyebrow="LinkedIn Post Generator"
      title="Turn raw ideas into structured LinkedIn drafts."
      description="This page will help creators choose a post type, add notes, and generate a draft that can move directly into the formatter."
      inputs={["Raw idea", "Post type", "Audience", "Point of view", "Call to action"]}
      outputs={["Story post", "Lesson post", "Launch post", "Opinion post", "Formatted draft handoff"]}
    />
  );
}
