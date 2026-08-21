import { StarterToolPage } from "../../components/StarterToolPage";

export default function HashtagGeneratorPage() {
  return (
    <StarterToolPage
      eyebrow="LinkedIn Hashtag Generator"
      title="Create balanced hashtag sets for reach and relevance."
      description="This page will suggest hashtags from a draft or topic and group them by broad, category, niche, and branded use."
      inputs={["Post text or topic", "Industry", "Audience", "Brand terms to include or avoid"]}
      outputs={["Broad hashtags", "Niche hashtags", "Community hashtags", "Branded hashtags", "Copy-ready hashtag line"]}
    />
  );
}
