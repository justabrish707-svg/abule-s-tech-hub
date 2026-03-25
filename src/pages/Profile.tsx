import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ScrollReveal from "@/components/ScrollReveal";

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to update avatar URL.");
    } else {
      setAvatarUrl(newUrl);
      toast.success("Avatar updated!");
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    uploadAvatar(file);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="pt-16">
      <div className="container max-w-lg py-16">
        <ScrollReveal>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground mb-10">
            Update your username and avatar.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          {/* Avatar */}
          <div className="flex flex-col items-center mb-10">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative group rounded-full w-28 h-28 border-2 border-border bg-secondary overflow-hidden transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-foreground" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-3">
              {uploading ? "Uploading..." : "Click to change avatar"}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          {/* Username */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-md border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-md border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
              <Save className="h-4 w-4" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
};

export default Profile;
