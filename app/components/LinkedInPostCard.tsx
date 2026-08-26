import { Globe2, MessageCircle, MoreHorizontal, Repeat2, Send, ThumbsUp } from "lucide-react";

type LinkedInPostCardProps = {
  text: string;
  author?: string;
  avatarLabel?: string;
  device?: "desktop" | "mobile";
  expanded?: boolean;
  imageUrl?: string;
  meta?: string;
  onToggleExpanded?: () => void;
  postedAt?: string;
  truncateAt?: number;
  withMedia?: boolean;
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
  author = "Forbidden AI",
  avatarLabel = "403AI",
  device = "desktop",
  expanded = true,
  imageUrl = "",
  meta = "Build at 403ai.org | Built by AI - Overseen by Humans",
  onToggleExpanded,
  postedAt = "3h",
  truncateAt = 210,
  withMedia = false,
}: LinkedInPostCardProps) {
  const hasMedia = withMedia || Boolean(imageUrl);
  const lineCap = device === "mobile" ? 2 : 3;
  const rawText = text || "Your formatted post appears here.";
  const lineCount = rawText.split("\n").length;
  const shouldTruncate = rawText.length > truncateAt || lineCount > lineCap;

  return (
    <div className={`linkedin-preview-shell ${device}`} aria-label={`${device} LinkedIn feed preview`}>
      {device === "desktop" && (
        <>
          <aside className="linkedin-sidebar left">
            <div className="sidebar-cover" />
            <span className="sidebar-avatar">{avatarLabel}</span>
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
          <span className="linkedin-avatar">{avatarLabel}</span>
          <div className="linkedin-author-copy">
            <strong>
              {author}
              <span> • 1st</span>
            </strong>
            <small>{meta}</small>
            <small className="linkedin-post-time">
              {postedAt} • <Globe2 aria-hidden="true" size={12} />
            </small>
          </div>
          <button aria-label="Post options" className="linkedin-icon-button" type="button">
            <MoreHorizontal aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="linkedin-post-text-wrap">
          <p
            className={!expanded && shouldTruncate ? "linkedin-post-text collapsed" : "linkedin-post-text"}
            style={!expanded && shouldTruncate ? { WebkitLineClamp: lineCap } : undefined}
          >
            {renderLinkedInText(rawText)}
          </p>
          {!expanded && shouldTruncate && (
            <button className="more-link" onClick={onToggleExpanded} type="button">
              more
            </button>
          )}
          {expanded && shouldTruncate && onToggleExpanded && (
            <button className="more-link less" onClick={onToggleExpanded} type="button">
              show less
            </button>
          )}
        </div>

        {hasMedia && (
          <div className="post-image-preview">
            {imageUrl ? <img alt="Post attachment preview" src={imageUrl} /> : <div className="post-image-placeholder">403AI</div>}
          </div>
        )}

        <div className="linkedin-social-proof">
          <span className="reaction-stack" aria-label="Reactions">
            <span className="reaction-icon like">👍</span>
            <span className="reaction-icon celebrate">👏</span>
            <span className="reaction-icon love">❤️</span>
          </span>
          <span>86</span>
          <span className="linkedin-comment-count">3 comments • 1 repost</span>
        </div>

        <div className="linkedin-actions" aria-label="Post actions">
          {device === "mobile" && (
            <span className="linkedin-action-avatar">
              <span className="linkedin-avatar tiny">{avatarLabel}</span>
            </span>
          )}
          <button type="button">
            <ThumbsUp aria-hidden="true" size={device === "mobile" ? 18 : 20} strokeWidth={1.9} />
            <span>Like</span>
          </button>
          <button type="button">
            <MessageCircle aria-hidden="true" size={device === "mobile" ? 18 : 20} strokeWidth={1.9} />
            <span>Comment</span>
          </button>
          <button type="button">
            <Repeat2 aria-hidden="true" size={device === "mobile" ? 18 : 20} strokeWidth={1.9} />
            <span>Repost</span>
          </button>
          <button type="button">
            <Send aria-hidden="true" size={device === "mobile" ? 18 : 20} strokeWidth={1.9} />
            <span>Send</span>
          </button>
        </div>
      </article>

      {device === "desktop" && (
        <div className="linkedin-start-post">
          <span className="linkedin-avatar small">{avatarLabel}</span>
          <span>Start a post</span>
        </div>
      )}
    </div>
  );
}
