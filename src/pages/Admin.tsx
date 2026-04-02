import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, Eye, FileText, Clock, Tag, Type, AlignLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogPosts, type BlogPost } from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

interface PostForm {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
}

const emptyForm: PostForm = {
  id: "",
  title: "",
  excerpt: "",
  content: "",
  category: "Programming",
  read_time: "5 min",
};

const categoryOptions = ["Programming", "Web Dev", "Cybersecurity"];

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: posts = [], isLoading } = useBlogPosts();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<PostForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  if (!user) return null;

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);

  const handleNew = () => {
    setEditing({ ...emptyForm });
    setIsNew(true);
    setPreview(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditing({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      read_time: post.read_time,
    });
    setIsNew(false);
    setPreview(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsNew(false);
    setPreview(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const slug = isNew ? generateSlug(editing.title) : editing.id;

      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert({
          id: slug,
          title: editing.title.trim(),
          excerpt: editing.excerpt.trim(),
          content: editing.content.trim(),
          category: editing.category,
          read_time: editing.read_time,
          author_id: user.id,
        });
        if (error) throw error;
        toast.success("Post published successfully! 🎉");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: editing.title.trim(),
            excerpt: editing.excerpt.trim(),
            content: editing.content.trim(),
            category: editing.category,
            read_time: editing.read_time,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Post updated successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      handleCancel();
    } catch (err: any) {
      toast.error(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="pt-16 min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container max-w-5xl py-12 relative">
          <ScrollReveal>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary tracking-wider uppercase">Dashboard</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Manage Posts
                </h1>
                <p className="text-muted-foreground">
                  Create, edit, and manage your blog content
                </p>
              </div>
              {!editing && (
                <button
                  onClick={handleNew}
                  className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  New Post
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </button>
              )}
            </div>

            {/* Stats bar */}
            {!editing && (
              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{posts.length}</span> posts
                  </span>
                </div>
                {categoryOptions.map((cat) => {
                  const count = posts.filter((p) => p.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <div key={cat} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary/60" />
                      <span className="text-sm text-muted-foreground">
                        {count} {cat}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        {editing ? (
          <ScrollReveal>
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-black/10">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-6 py-4 bg-secondary/30 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-primary/60" />
                  <span className="ml-2 text-sm font-medium text-foreground">
                    {isNew ? "New Post" : "Editing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreview(!preview)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      preview
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" /> {preview ? "Editing" : "Preview"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>

              <div className="p-6">
                {preview ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="px-3 py-1 inline-block rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {editing.category}
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{editing.title || "Untitled"}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{editing.excerpt}</p>
                    <div className="pt-6 border-t border-border/30 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-mono">
                      {editing.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
                        <Type className="h-3.5 w-3.5" /> Title
                      </label>
                      <input
                        type="text"
                        value={editing.title}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        placeholder="An eye-catching title..."
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/50 text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
                        <AlignLeft className="h-3.5 w-3.5" /> Excerpt
                      </label>
                      <input
                        type="text"
                        value={editing.excerpt}
                        onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                        placeholder="A brief summary of your post..."
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
                          <Tag className="h-3.5 w-3.5" /> Category
                        </label>
                        <select
                          value={editing.category}
                          onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                        >
                          {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> Read Time
                        </label>
                        <input
                          type="text"
                          value={editing.read_time}
                          onChange={(e) => setEditing({ ...editing, read_time: e.target.value })}
                          placeholder="5 min"
                          className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" /> Content
                        <span className="text-xs text-muted-foreground/60 font-normal ml-1">
                          Markdown: ## headings, **bold**, `code`, ```blocks```
                        </span>
                      </label>
                      <textarea
                        value={editing.content}
                        onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                        placeholder="Write your post content here..."
                        rows={18}
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground font-mono leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-y"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground/60">
                        {editing.content.length} characters · ~{Math.ceil(editing.content.split(/\s+/).filter(Boolean).length / 200)} min read
                      </p>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : isNew ? "Publish Post" : "Update Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-border/30 bg-card animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-24">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Create your first post to get started</p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                <Plus className="h-4 w-4" /> Create Post
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 40}>
                <div className="group flex items-center justify-between rounded-xl border border-border/30 bg-card p-5 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex-1 min-w-0 mr-6">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wide">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.read_time}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Admin;
