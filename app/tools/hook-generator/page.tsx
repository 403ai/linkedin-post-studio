import { StarterToolPage } from "../../components/StarterToolPage";

export default function HookGeneratorPage() {
  return (
    <StarterToolPage
      eyebrow="LinkedIn Hook Generator"
      title="Draft opening lines that earn the next sentence."
      description="This page will help creators generate multiple hook angles from one idea, then refine the strongest option before sending it to the formatter."
      inputs={["Post topic", "Target reader", "Desired tone", "Contrarian angle or proof point"]}
      outputs={["Curiosity hook", "Practical value hook", "Story hook", "Contrarian hook", "Cleaner rewrite options"]}
    />
  );
}
