import { Globe2, MessageCircle, MoreHorizontal, Repeat2, Send, ThumbsUp } from "lucide-react";

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

function renderLinkedInText(text: string) {
  const parts = text.split(/(#[\p{L}\p{N}_]+)/gu);

  return parts.map((part, index) =>
    part.startsWith("#") ? (
      <span className="linkedin-hashtag" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function LinkedInPostCard({
  text,
  author = "Alex Dahud",
  device = "desktop",
  expanded = true,
  imageUrl = "",
  meta = "Growth at Typegrow | Helping you grow LinkedIn audience with AI",
  onToggleExpanded,
  truncateAt = 210,
}: LinkedInPostCardProps) {
  const shouldTruncate = text.length > truncateAt;
  const displayText = !expanded && shouldTruncate ? text.slice(0, truncateAt).trimEnd() : text;
  const initials = author
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`linkedin-preview-shell ${device}`} aria-label={`${device} LinkedIn feed preview`}>
      {device === "desktop" && (
        <>
          <aside className="linkedin-sidebar left">
            <div className="sidebar-cover" />
            <span className="sidebar-avatar">{initials}</span>
            <strong>{author}</strong>
            <small>{meta}</small>
          </aside>
          <aside className="linkedin-sidebar right">
            <strong>LinkedIn News</strong>
            <span>Top stories in your network</span>
            <span>Creator tools and AI updates</span>
          </aside>
        </>
      )}

      {device === "mobile" && (
        <div className="linkedin-mobile-topbar">
          <span className="linkedin-mark">in</span>
          <span className="mobile-search">Search</span>
          <MessageCircle aria-hidden="true" size={19} />
        </div>
      )}

      <article className={`linkedin-post-card ${device}`}>
        <header className="linkedin-post-header">
          <span className="linkedin-avatar">{initials}</span>
          <div className="linkedin-author-copy">
            <strong>
              {author}
              <span> • 1st</span>
            </strong>
            <small>{meta}</small>
            <small className="linkedin-post-time">
              12h • <Globe2 aria-hidden="true" size={12} />
            </small>
          </div>
          <button aria-label="Post options" className="linkedin-icon-button" type="button">
            <MoreHorizontal aria-hidden="true" size={20} />
          </button>
        </header>

        <p className="linkedin-post-text">
          {renderLinkedInText(displayText || "Your formatted post appears here.")}
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

        <div className="linkedin-social-proof">
          <span className="reaction-stack" aria-label="Reactions">
            <span>👍</span>
            <span>❤️</span>
            <span>💡</span>
          </span>
          <span>92</span>
          <span className="linkedin-comment-count">49 comments • 3 reposts</span>
        </div>

        <div className="linkedin-actions" aria-label="Post actions">
          <button type="button">
            <ThumbsUp aria-hidden="true" size={20} />
            <span>Like</span>
          </button>
          <button type="button">
            <MessageCircle aria-hidden="true" size={20} />
            <span>Comment</span>
          </button>
          <button type="button">
            <Repeat2 aria-hidden="true" size={20} />
            <span>Repost</span>
          </button>
          <button type="button">
            <Send aria-hidden="true" size={20} />
            <span>Send</span>
          </button>
        </div>
      </article>

      {device === "desktop" && (
        <div className="linkedin-start-post">
          <span className="linkedin-avatar small">{initials}</span>
          <span>Start a post</span>
        </div>
      )}
    </div>
  );
}
