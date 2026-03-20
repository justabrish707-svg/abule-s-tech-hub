import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import ScrollReveal from "@/components/ScrollReveal";
import { blogPosts, categories } from "@/data/blogPosts";

const Blog = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <main className="pt-16">
      <div className="container py-16">
        <ScrollReveal>
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-muted-foreground mb-8">
            Tutorials, guides, and thoughts on programming, cybersecurity, and tech.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors active:scale-95 ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-1">No posts found.</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-primary text-sm hover:underline">
                Clear filters
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 60}>
                <BlogCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Blog;
