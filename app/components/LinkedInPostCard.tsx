type LinkedInPostCardProps = {
  text: string;
  author?: string;
  device?: "desktop" | "mobile";
  expanded?: boolean;
  imageUrl?: string;
  meta?: string;
  onToggleExpanded?: () => void;
  truncateAt?: number;
};

export function LinkedInPostCard({
  text,
  author = "Creator workspace",
  device = "desktop",
  expanded = true,
  imageUrl = "",
  meta = "LinkedIn content tools • now",
  onToggleExpanded,
  truncateAt = 210,
}: LinkedInPostCardProps) {
  const shouldTruncate = text.length > truncateAt;
  const displayText = !expanded && shouldTruncate ? text.slice(0, truncateAt).trimEnd() : text;

  return (
    <div className={`mini-post ${device}`} aria-label="LinkedIn style post preview">
      <div className="post-author">
        <span className="avatar">AD</span>
        <div>
          <strong>{author}</strong>
          <span>{meta}</span>
          <span>12h • 🌐</span>
        </div>
      </div>
      <p>
        {displayText || "Your formatted post appears here."}
        {!expanded && shouldTruncate && (
          <>
            <span className="preview-fade">...</span>
            <button className="more-link" onClick={onToggleExpanded} type="button">
              more
            </button>
          </>
        )}
        {expanded && shouldTruncate && onToggleExpanded && (
          <button className="more-link less" onClick={onToggleExpanded} type="button">
            show less
          </button>
        )}
      </p>
      {imageUrl && (
        <div className="post-image-preview">
          <img alt="Post attachment preview" src={imageUrl} />
        </div>
      )}
      <div className="post-metrics">
        <span>💜 ❤️ ✅ 92</span>
        <span>49 comments • 3 reposts</span>
      </div>
      <div className="post-actions" aria-hidden="true">
        <span>♡ Like</span>
        <span>💬 Comment</span>
        <span>↗ Repost</span>
        <span>➤ Send</span>
      </div>
    </div>
  );
}
