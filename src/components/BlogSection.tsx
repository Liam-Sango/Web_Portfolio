"use client";

import { useState, useMemo } from "react";
import blogPosts, { getAllTags, filterPosts } from "@/data/blog";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogSection() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);
  const allTags = useMemo(() => getAllTags(), []);

  const visiblePosts = useMemo(
    () => filterPosts(activeTag, search || undefined),
    [activeTag, search],
  );

  return (
    <section className="glass-card section" aria-labelledby="blog-heading">
      <span className="section-eyebrow">05 — Writing</span>
      <h2 id="blog-heading" className="section-heading">
        From the Blog
      </h2>
      <p className="section-intro">
        Notes on engineering, design, and the tools I rely on.
      </p>

      {/* Search */}
      <div className="blog-toolbar">
        <label htmlFor="blog-search" className="sr-only">
          Search posts
        </label>
        <input
          id="blog-search"
          type="text"
          className="search-input"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="blog-filters" role="group" aria-label="Filter by tag">
          <button
            type="button"
            className={`tag${!activeTag ? " tag--active" : ""}`}
            onClick={() => setActiveTag(undefined)}
            aria-pressed={!activeTag}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag${activeTag === tag ? " tag--active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? undefined : tag)}
              aria-pressed={activeTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      {visiblePosts.length === 0 ? (
        <p className="empty-state">
          {blogPosts.length === 0
            ? "No posts yet. Check back soon!"
            : "No posts match your search."}
        </p>
      ) : (
        <div className="blog-list">
          {visiblePosts.map((post) => (
            <article key={post.id} className="blog-post">
              <h3>{post.title}</h3>
              <p className="card-meta">{formatDate(post.date)}</p>
              <p>{post.excerpt}</p>
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
