type LinkedInPostCardProps = {
  text: string;
  author?: string;
  meta?: string;
};

export function LinkedInPostCard({
  text,
  author = "Creator workspace",
  meta = "LinkedIn content tools • now",
}: LinkedInPostCardProps) {
  return (
    <div className="mini-post" aria-label="LinkedIn style post preview">
      <div className="post-author">
        <span className="avatar">403</span>
        <div>
          <strong>{author}</strong>
          <span>{meta}</span>
        </div>
      </div>
      <p>{text || "Your formatted post appears here."}</p>
      <div className="post-metrics">
        <span>57 reactions</span>
        <span>24 comments</span>
        <span>{text.length} chars</span>
      </div>
    </div>
  );
}
