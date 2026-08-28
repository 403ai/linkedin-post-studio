import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  assetPrefix: isGitHubPages ? "/linkedin-post-studio/" : undefined,
  basePath: isGitHubPages ? "/linkedin-post-studio" : undefined,
  images: {
    unoptimized: true,
  },
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: true,
};

export default nextConfig;
