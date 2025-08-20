import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface SEOIssue {
  type: "error" | "warning" | "info";
  message: string;
}

// Only show in development
const SEOChecker = () => {
  const location = useLocation();
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return;

    const checkSEO = () => {
      const newIssues: SEOIssue[] = [];

      // Check title
      const title = document.title;
      if (!title || title.length < 10) {
        newIssues.push({
          type: "error",
          message: "Page title is missing or too short (minimum 10 characters)",
        });
      } else if (title.length > 60) {
        newIssues.push({
          type: "warning",
          message: `Page title is too long (${title.length} chars, recommended max 60)`,
        });
      }

      // Check meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (!metaDescription) {
        newIssues.push({
          type: "error",
          message: "Meta description is missing",
        });
      } else {
        const content = metaDescription.getAttribute("content") || "";
        if (content.length < 120) {
          newIssues.push({
            type: "warning",
            message: `Meta description is too short (${content.length} chars, recommended 120-160)`,
          });
        } else if (content.length > 160) {
          newIssues.push({
            type: "warning",
            message: `Meta description is too long (${content.length} chars, recommended max 160)`,
          });
        }
      }

      // Check H1 tags
      const h1Tags = document.querySelectorAll("h1");
      if (h1Tags.length === 0) {
        newIssues.push({
          type: "error",
          message: "No H1 tag found on page",
        });
      } else if (h1Tags.length > 1) {
        newIssues.push({
          type: "warning",
          message: `Multiple H1 tags found (${h1Tags.length}), should have only one`,
        });
      }

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        newIssues.push({
          type: "warning",
          message: "Canonical URL is missing",
        });
      }

      // Check Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector(
        'meta[property="og:description"]',
      );
      const ogImage = document.querySelector('meta[property="og:image"]');

      if (!ogTitle) {
        newIssues.push({
          type: "warning",
          message: "Open Graph title is missing",
        });
      }
      if (!ogDescription) {
        newIssues.push({
          type: "warning",
          message: "Open Graph description is missing",
        });
      }
      if (!ogImage) {
        newIssues.push({
          type: "info",
          message: "Open Graph image is missing",
        });
      }

      // Check images without alt text
      const imagesWithoutAlt = document.querySelectorAll(
        'img:not([alt]), img[alt=""]',
      );
      if (imagesWithoutAlt.length > 0) {
        newIssues.push({
          type: "warning",
          message: `${imagesWithoutAlt.length} image(s) missing alt text`,
        });
      }

      setIssues(newIssues);
    };

    // Check after a delay to allow content to load
    const timer = setTimeout(checkSEO, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Don't render in production
  if (process.env.NODE_ENV !== "development") return null;

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;

  // Hide the UI but keep SEO checking functionality running in background
  return null;
};

export default SEOChecker;
