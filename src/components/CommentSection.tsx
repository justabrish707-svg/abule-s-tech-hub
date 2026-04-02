import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useComments, useAddComment, useDeleteComment, type Comment } from "@/hooks/useComments";
import { MessageSquare, Reply, Trash2, Send, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

const CommentSection = ({ postId }: { postId: string }) => {
  const { user, profile } = useAuth();
  const { data: comments = [], isLoading } = useComments(postId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    try {
      await addComment.mutateAsync({ postId, content, userId: user.id });
      setContent("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;
    try {
      await addComment.mutateAsync({ postId, content: replyContent, parentId, userId: user.id });
      setReplyContent("");
      setReplyTo(null);
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment.mutateAsync({ id, postId });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const isOwner = user?.id === comment.user_id;
    const username = comment.profiles?.username || "Anonymous";
    const avatarUrl = comment.profiles?.avatar_url;
    const childReplies = replies(comment.id);

    return (
      <div className={`${depth > 0 ? "ml-6 pl-4 border-l-2 border-border/30" : ""}`}>
        <div className="group rounded-lg p-4 bg-card/50 border border-border/30 hover:border-border/50 transition-colors">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{username}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-2 mt-2">
                {user && depth < 2 && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Reply className="h-3 w-3" /> Reply
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {replyTo === comment.id && (
          <div className="mt-2 ml-11">
            <div className="flex gap-2">
              <input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                maxLength={500}
              />
              <button
                onClick={() => handleReply(comment.id)}
                disabled={addComment.isPending || !replyContent.trim()}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {childReplies.length > 0 && (
          <div className="mt-2 space-y-2">
            {childReplies.map((r) => (
              <CommentItem key={r.id} comment={r} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollReveal delay={200}>
      <section className="mt-12 pt-8 border-t border-border/50">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-6">
          <MessageSquare className="h-5 w-5 text-primary" />
          Comments ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {(profile?.username || user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={addComment.isPending || !content.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {addComment.isPending ? "Posting..." : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 rounded-xl border border-border/50 bg-secondary/30 text-center">
            <p className="text-sm text-muted-foreground mb-2">Sign in to join the conversation</p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {topLevel.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </div>
        )}
      </section>
    </ScrollReveal>
  );
};

export default CommentSection;
