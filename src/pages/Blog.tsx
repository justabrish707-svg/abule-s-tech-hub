import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import ScrollReveal from "@/components/ScrollReveal";
import SEO from "@/components/SEO";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlogPosts";

const Blog = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: blogPosts = [], isLoading } = useBlogPosts();
  const { data: categories = ["All"] } = useBlogCategories();

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category, blogPosts]);

  return (
    <main className="pt-16">
      <SEO
        title="Blog — Tutorials on Web Dev & Cybersecurity | Abule Tech"
        description="Beginner-friendly tutorials and guides on HTML, CSS, JavaScript, React, programming, and cybersecurity by Abraham Admasu."
        path="/blog"
      />
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container py-16 relative">
          <ScrollReveal>
            <p className="text-sm font-medium text-primary mb-2">Blog</p>
            <h1 className="text-4xl font-bold mb-3">Articles & Tutorials</h1>
            <p className="text-muted-foreground max-w-lg">
              Tutorials, guides, and thoughts on programming, cybersecurity, and tech.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="container py-10">
        <ScrollReveal delay={100}>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                aria-label="Search blog posts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap items-center">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1 hidden sm:block" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    category === cat
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 animate-pulse h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No posts found</p>
              <p className="text-sm mb-4">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-primary text-sm font-medium hover:underline">
                Clear all filters
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 60}>
                <BlogCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            Showing {filtered.length} of {blogPosts.length} posts
          </p>
        )}
      </div>
    </main>
  );
};

export default Blog;
