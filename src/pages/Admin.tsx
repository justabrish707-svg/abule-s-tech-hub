import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, Eye } from "lucide-react";
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
        toast.success("Post created!");
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
        toast.success("Post updated!");
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
    <main className="pt-16">
      <div className="container max-w-4xl py-16">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your blog posts</p>
            </div>
            {!editing && (
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" /> New Post
              </button>
            )}
          </div>
        </ScrollReveal>

        {editing ? (
          <ScrollReveal>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {isNew ? "Create Post" : "Edit Post"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreview(!preview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> {preview ? "Edit" : "Preview"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>

              {preview ? (
                <div className="space-y-4">
                  <div className="px-2.5 py-1 inline-block rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {editing.category}
                  </div>
                  <h3 className="text-2xl font-bold">{editing.title || "Untitled"}</h3>
                  <p className="text-muted-foreground">{editing.excerpt}</p>
                  <div className="pt-4 border-t border-border/50 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                    {editing.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Title</label>
                    <input
                      type="text"
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      placeholder="Post title..."
                      className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Excerpt</label>
                    <input
                      type="text"
                      value={editing.excerpt}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      placeholder="Short description..."
                      className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Category</label>
                      <select
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Read Time</label>
                      <input
                        type="text"
                        value={editing.read_time}
                        onChange={(e) => setEditing({ ...editing, read_time: e.target.value })}
                        placeholder="5 min"
                        className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Content <span className="text-muted-foreground font-normal">(Markdown supported: ## headings, **bold**, `code`, ```code blocks```)</span>
                    </label>
                    <textarea
                      value={editing.content}
                      onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                      placeholder="Write your post content here..."
                      rows={16}
                      className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : isNew ? "Publish" : "Update"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border border-border/50 bg-card animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-16 text-muted-foreground">
              <p>No posts yet. Create your first one!</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-2">
            {posts.map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 40}>
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
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
