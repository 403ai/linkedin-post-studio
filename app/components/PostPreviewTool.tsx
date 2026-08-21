"use client";

import { useState } from "react";
import { LinkedInPostCard } from "./LinkedInPostCard";

const defaultPreview = `Your first line has one job: earn the second line.

Keep the post readable.
Use space deliberately.
Make the next action obvious.`;

export function PostPreviewTool() {
  const [post, setPost] = useState(defaultPreview);

  return (
    <div className="tool-split">
      <label className="editor-panel compact">
        <span>Post text</span>
        <textarea value={post} onChange={(event) => setPost(event.target.value)} />
      </label>
      <LinkedInPostCard text={post} author="Preview profile" meta="Post preview • draft" />
    </div>
  );
}
