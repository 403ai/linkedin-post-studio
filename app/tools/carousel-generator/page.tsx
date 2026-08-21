import { StarterToolPage } from "../../components/StarterToolPage";

export default function CarouselGeneratorPage() {
  return (
    <StarterToolPage
      eyebrow="LinkedIn Carousel Generator"
      title="Plan carousel slides from one idea or long post."
      description="This page will map a topic into a slide-by-slide narrative before visual design and export features are added."
      inputs={["Topic or long post", "Slide count", "Audience", "Takeaway", "Visual style notes"]}
      outputs={["Cover slide hook", "Slide outline", "Per-slide copy", "Closing CTA", "Design/export backlog"]}
    />
  );
}
