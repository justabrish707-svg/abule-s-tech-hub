import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoverImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  postId?: string;
}

const CoverImageUpload = ({ value, onChange, postId }: CoverImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${postId || crypto.randomUUID()}/cover.${ext}`;

    const { error } = await supabase.storage
      .from("blog-covers")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
    onChange(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  };

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
        <ImagePlus className="h-3.5 w-3.5" /> Cover Image
      </label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-secondary/50">
          <img src={value} alt="Cover" className="w-full h-48 object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-xl border-2 border-dashed border-border/50 bg-secondary/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs font-medium">{uploading ? "Uploading..." : "Click to upload cover image"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
};

export default CoverImageUpload;
