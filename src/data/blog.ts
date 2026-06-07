export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string; // ISO date
  content: string; // HTML or Markdown rendered content
}

// ─────────────────────────────────────────────────────────────
// Sample data — replace these with your real posts.
// Posts are filterable by tag and searchable by title/excerpt.
// ─────────────────────────────────────────────────────────────
const blogPosts: BlogPost[] = [
  {
    id: "shipping-less-code",
    title: "Shipping Less Code",
    excerpt:
      "The features I'm proudest of are the ones I deleted. A look at how subtraction — not addition — became my default tool for keeping systems maintainable.",
    tags: ["engineering", "philosophy"],
    date: "2026-05-22",
    content:
      "<p>The features I'm proudest of are the ones I deleted...</p>",
  },
  {
    id: "websockets-at-scale",
    title: "Keeping 10,000 WebSockets Honest",
    excerpt:
      "Notes from building the real-time layer behind Lumen Analytics — backpressure, heartbeats, and the day a single slow consumer nearly took the whole fleet down.",
    tags: ["engineering", "realtime", "performance"],
    date: "2026-03-08",
    content:
      "<p>Real-time systems fail in interesting ways...</p>",
  },
  {
    id: "why-i-still-write-css",
    title: "Why I Still Write CSS by Hand",
    excerpt:
      "Utility frameworks are great, but every so often I reach for a plain stylesheet and a handful of custom properties. Here's when, and why it still feels good.",
    tags: ["css", "frontend", "design"],
    date: "2025-12-14",
    content:
      "<p>There's a particular calm to a well-organized stylesheet...</p>",
  },
];

/** All unique tags, sorted alphabetically */
export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const post of blogPosts) {
    for (const tag of post.tags) {
      set.add(tag);
    }
  }
  return [...set].sort();
}

/** Filter posts by tag and/or search query (searches title + excerpt). */
export function filterPosts(
  tag?: string,
  query?: string,
): BlogPost[] {
  let result = [...blogPosts];

  if (tag) {
    result = result.filter((p) => p.tags.includes(tag));
  }

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q),
    );
  }

  // newest first
  result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return result;
}

export default blogPosts;
