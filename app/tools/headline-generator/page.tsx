import { StarterToolPage } from "../../components/StarterToolPage";

export default function HeadlineGeneratorPage() {
  return (
    <StarterToolPage
      eyebrow="LinkedIn Headline Generator"
      title="Build profile headlines with a clear positioning arc."
      description="This page will turn role, audience, proof, and offer into headline variants that fit a LinkedIn profile."
      inputs={["Current role", "Audience served", "Main outcome", "Credibility signal", "Tone preference"]}
      outputs={["Direct headline", "Authority headline", "Outcome-led headline", "Founder-style headline", "Keyword-rich headline"]}
    />
  );
}
