export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string; // ISO date
  content: string; // HTML or Markdown rendered content
}

const blogPosts: BlogPost[] = [
  // Add your blog posts here. Example:
  // {
  //   id: "hello-world",
  //   title: "Hello, World",
  //   excerpt: "Welcome to my blog — first post about why I built this site.",
  //   tags: ["meta", "personal"],
  //   date: "2026-06-01",
  //   content: "<p>Welcome to my blog! This is my first post.</p>",
  // },
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
