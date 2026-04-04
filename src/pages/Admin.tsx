import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Save, X, Eye, FileText, Clock, Tag, Type, AlignLeft, Sparkles,
  Mail, MessageSquare, Users, FolderOpen, BarChart3, CheckCircle, Circle, ImagePlus
} from "lucide-react";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogPosts, type BlogPost } from "@/hooks/useBlogPosts";
import { useContactMessages, type ContactMessage } from "@/hooks/useContactMessages";
import { useSubscribers, type Subscriber } from "@/hooks/useNewsletter";
import { useProjects, useSaveProject, useDeleteProject, type Project } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

type Tab = "overview" | "posts" | "projects" | "messages" | "subscribers";

interface PostForm {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  cover_image: string | null;
}

interface ProjectForm {
  id?: string;
  title: string;
  description: string;
  tech: string;
  github: string;
  demo: string;
  status: string;
  display_order: number;
}

const emptyPostForm: PostForm = { id: "", title: "", excerpt: "", content: "", category: "Programming", read_time: "5 min", cover_image: null };
const emptyProjectForm: ProjectForm = { title: "", description: "", tech: "", github: "", demo: "", status: "planned", display_order: 0 };
const categoryOptions = ["Programming", "Web Dev", "Cybersecurity"];

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: posts = [], isLoading: postsLoading } = useBlogPosts();
  const { data: messages = [] } = useContactMessages();
  const { data: subscribers = [] } = useSubscribers();
  const { data: projects = [] } = useProjects();
  const queryClient = useQueryClient();
  const saveProject = useSaveProject();
  const deleteProjectMut = useDeleteProject();

  const [tab, setTab] = useState<Tab>("overview");
  const [editingPost, setEditingPost] = useState<PostForm | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  useEffect(() => { if (!user) navigate("/auth"); }, [user, navigate]);
  if (!user) return null;

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);

  // Post handlers
  const handleNewPost = () => { setEditingPost({ ...emptyPostForm }); setIsNewPost(true); setPreview(false); setTab("posts"); };
  const handleEditPost = (p: BlogPost) => { setEditingPost({ id: p.id, title: p.title, excerpt: p.excerpt, content: p.content, category: p.category, read_time: p.read_time }); setIsNewPost(false); setPreview(false); };
  const handleCancelPost = () => { setEditingPost(null); setIsNewPost(false); setPreview(false); };

  const handleSavePost = async () => {
    if (!editingPost || !editingPost.title.trim() || !editingPost.content.trim()) { toast.error("Title and content required"); return; }
    setSaving(true);
    try {
      if (isNewPost) {
        const { error } = await supabase.from("blog_posts").insert({ id: generateSlug(editingPost.title), title: editingPost.title.trim(), excerpt: editingPost.excerpt.trim(), content: editingPost.content.trim(), category: editingPost.category, read_time: editingPost.read_time, author_id: user.id });
        if (error) throw error;
        toast.success("Post published! 🎉");
      } else {
        const { error } = await supabase.from("blog_posts").update({ title: editingPost.title.trim(), excerpt: editingPost.excerpt.trim(), content: editingPost.content.trim(), category: editingPost.category, read_time: editingPost.read_time, updated_at: new Date().toISOString() }).eq("id", editingPost.id);
        if (error) throw error;
        toast.success("Post updated!");
      }
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      handleCancelPost();
    } catch (err: any) { toast.error(err.message || "Failed to save"); } finally { setSaving(false); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    } catch (err: any) { toast.error(err.message); }
  };

  // Project handlers
  const handleNewProject = () => { setEditingProject({ ...emptyProjectForm }); setIsNewProject(true); setTab("projects"); };
  const handleEditProject = (p: Project) => { setEditingProject({ id: p.id, title: p.title, description: p.description, tech: (p.tech || []).join(", "), github: p.github || "", demo: p.demo || "", status: p.status, display_order: p.display_order }); setIsNewProject(false); };
  const handleCancelProject = () => { setEditingProject(null); setIsNewProject(false); };

  const handleSaveProject = async () => {
    if (!editingProject || !editingProject.title.trim()) { toast.error("Title required"); return; }
    try {
      await saveProject.mutateAsync({
        ...(editingProject.id ? { id: editingProject.id } : {}),
        title: editingProject.title.trim(),
        description: editingProject.description.trim(),
        tech: editingProject.tech.split(",").map((t) => t.trim()).filter(Boolean),
        github: editingProject.github || null,
        demo: editingProject.demo || null,
        status: editingProject.status,
        display_order: editingProject.display_order,
      });
      toast.success(editingProject.id ? "Project updated!" : "Project added!");
      handleCancelProject();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try { await deleteProjectMut.mutateAsync(id); toast.success("Project deleted"); } catch (err: any) { toast.error(err.message); }
  };

  const unreadMessages = messages.filter((m) => !m.is_read).length;
  const activeSubscribers = subscribers.filter((s) => s.is_active).length;

  const tabs: { key: Tab; label: string; icon: typeof FileText; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "posts", label: "Posts", icon: FileText, badge: posts.length },
    { key: "projects", label: "Projects", icon: FolderOpen, badge: projects.length },
    { key: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
    { key: "subscribers", label: "Subscribers", icon: Users, badge: activeSubscribers },
  ];

  return (
    <main className="pt-16 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container max-w-6xl py-10 relative">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary tracking-wider uppercase">Admin Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Welcome back</h1>
          </ScrollReveal>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-6 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        {/* Overview Tab */}
        {tab === "overview" && (
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Blog Posts", value: posts.length, icon: FileText, color: "text-primary" },
                { label: "Projects", value: projects.length, icon: FolderOpen, color: "text-primary" },
                { label: "Messages", value: messages.length, icon: MessageSquare, color: unreadMessages > 0 ? "text-amber-400" : "text-primary", sub: unreadMessages > 0 ? `${unreadMessages} unread` : undefined },
                { label: "Subscribers", value: activeSubscribers, icon: Users, color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.sub && <p className="text-xs text-amber-400 mt-1">{stat.sub}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="text-sm font-semibold mb-4">Recent Messages</h3>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${m.is_read ? "bg-muted-foreground/30" : "bg-primary"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <h3 className="text-sm font-semibold mb-4">Posts by Category</h3>
                {categoryOptions.map((cat) => {
                  const count = posts.filter((p) => p.category === cat).length;
                  const pct = posts.length > 0 ? (count / posts.length) * 100 : 0;
                  return (
                    <div key={cat} className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{cat}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Posts Tab */}
        {tab === "posts" && (
          <div>
            {!editingPost && (
              <div className="flex justify-end mb-4">
                <button onClick={handleNewPost} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95">
                  <Plus className="h-4 w-4" /> New Post
                </button>
              </div>
            )}

            {editingPost ? (
              <ScrollReveal>
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-black/10">
                  <div className="flex items-center justify-between px-6 py-4 bg-secondary/30 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-destructive/60" />
                      <div className="h-3 w-3 rounded-full bg-muted-foreground/40" />
                      <div className="h-3 w-3 rounded-full bg-primary/60" />
                      <span className="ml-2 text-sm font-medium">{isNewPost ? "New Post" : "Editing"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPreview(!preview)} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${preview ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"}`}>
                        <Eye className="h-3.5 w-3.5" /> {preview ? "Editing" : "Preview"}
                      </button>
                      <button onClick={handleCancelPost} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {preview ? (
                      <div className="space-y-4 animate-fade-in">
                        <div className="px-3 py-1 inline-block rounded-full bg-primary/10 text-primary text-xs font-medium">{editingPost.category}</div>
                        <h3 className="text-3xl font-bold tracking-tight">{editingPost.title || "Untitled"}</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">{editingPost.excerpt}</p>
                        <div className="pt-6 border-t border-border/30 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-mono">{editingPost.content}</div>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-fade-in">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground"><Type className="h-3.5 w-3.5" /> Title</label>
                          <input type="text" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} placeholder="An eye-catching title..." className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/50 text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground"><AlignLeft className="h-3.5 w-3.5" /> Excerpt</label>
                          <input type="text" value={editingPost.excerpt} onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })} placeholder="A brief summary..." className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground"><Tag className="h-3.5 w-3.5" /> Category</label>
                            <select value={editingPost.category} onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer">
                              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Read Time</label>
                            <input type="text" value={editingPost.read_time} onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })} placeholder="5 min" className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground"><FileText className="h-3.5 w-3.5" /> Content <span className="text-xs text-muted-foreground/60 font-normal ml-1">Markdown supported</span></label>
                          <textarea value={editingPost.content} onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })} placeholder="Write your post content here..." rows={18} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/50 text-sm text-foreground font-mono leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-y" />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/30">
                          <p className="text-xs text-muted-foreground/60">{editingPost.content.length} chars · ~{Math.ceil(editingPost.content.split(/\s+/).filter(Boolean).length / 200)} min</p>
                          <button onClick={handleSavePost} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50">
                            <Save className="h-4 w-4" /> {saving ? "Saving..." : isNewPost ? "Publish" : "Update"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ) : postsLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-secondary/30 animate-pulse" />)}</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">No posts yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first post</p>
                <button onClick={handleNewPost} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"><Plus className="h-4 w-4" /> New Post</button>
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="group flex items-center justify-between rounded-xl border border-border/30 bg-card p-4 hover:border-primary/20 transition-all">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">{post.category}</span>
                        <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditPost(post)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {tab === "projects" && (
          <div>
            {!editingProject && (
              <div className="flex justify-end mb-4">
                <button onClick={handleNewProject} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95">
                  <Plus className="h-4 w-4" /> New Project
                </button>
              </div>
            )}

            {editingProject ? (
              <ScrollReveal>
                <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-xl shadow-black/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">{isNewProject ? "Add Project" : "Edit Project"}</h3>
                    <button onClick={handleCancelProject} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Title</label>
                      <input type="text" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} placeholder="Project name" className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
                      <textarea value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} rows={3} placeholder="What does this project do?" className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Tech (comma-separated)</label>
                        <input type="text" value={editingProject.tech} onChange={(e) => setEditingProject({ ...editingProject, tech: e.target.value })} placeholder="React, TypeScript" className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Status</label>
                        <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer">
                          <option value="completed">Completed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="planned">Planned</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">GitHub URL</label>
                        <input type="url" value={editingProject.github} onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })} placeholder="https://github.com/..." className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Demo URL</label>
                        <input type="url" value={editingProject.demo} onChange={(e) => setEditingProject({ ...editingProject, demo: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-border/30">
                      <button onClick={handleSaveProject} disabled={saveProject.isPending} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50">
                        <Save className="h-4 w-4" /> {saveProject.isPending ? "Saving..." : isNewProject ? "Add Project" : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <FolderOpen className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">No projects yet</p>
                <button onClick={handleNewProject} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold mt-3"><Plus className="h-4 w-4" /> Add Project</button>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} className="group flex items-center justify-between rounded-xl border border-border/30 bg-card p-4 hover:border-primary/20 transition-all">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${p.status === "completed" ? "text-primary" : p.status === "in-progress" ? "text-amber-400" : "text-muted-foreground"}`}>{p.status}</span>
                        <span className="text-xs text-muted-foreground">{(p.tech || []).join(", ")}</span>
                      </div>
                      <h3 className="text-sm font-semibold truncate">{p.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditProject(p)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteProject(p.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && (
          <ScrollReveal>
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">No messages yet</p>
                <p className="text-sm text-muted-foreground">Messages from your contact form will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`rounded-xl border bg-card p-5 transition-all ${m.is_read ? "border-border/30" : "border-primary/30 bg-primary/[0.02]"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {!m.is_read && <Circle className="h-2 w-2 fill-primary text-primary" />}
                        <span className="text-sm font-semibold">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.email}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollReveal>
        )}

        {/* Subscribers Tab */}
        {tab === "subscribers" && (
          <ScrollReveal>
            {subscribers.length === 0 ? (
              <div className="text-center py-20">
                <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">No subscribers yet</p>
                <p className="text-sm text-muted-foreground">People who subscribe via the newsletter form will appear here</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{activeSubscribers} active subscribers</p>
                </div>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/30">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s) => (
                        <tr key={s.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 text-sm">{s.email}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(s.subscribed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.is_active ? "text-primary" : "text-muted-foreground"}`}>
                              {s.is_active ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {s.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ScrollReveal>
        )}
      </div>
    </main>
  );
};

export default Admin;
