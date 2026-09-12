import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus,
  Video,
  X,
  Play,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { ProfileMedia } from "@/types";

interface ProfileMediaGalleryProps {
  userId: string;
  editable: boolean;
}

export function ProfileMediaGallery({ userId, editable }: ProfileMediaGalleryProps) {
  const [media, setMedia] = useState<ProfileMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ProfileMedia | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    const { data, error } = await supabase
      .from("profile_media")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (data && !error) {
      setMedia(
        data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          mediaUrl: row.media_url,
          mediaType: row.media_type,
          caption: row.caption ?? "",
          sortOrder: row.sort_order ?? 0,
          createdAt: new Date(row.created_at).getTime(),
        }))
      );
    }
  }, [userId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (file: File, type: "image" | "video") => {
    if (!file) return;

    const maxImage = 10 * 1024 * 1024;
    const maxVideo = 50 * 1024 * 1024;
    if (type === "image" && file.size > maxImage) {
      alert("Image must be under 10MB.");
      return;
    }
    if (type === "video" && file.size > maxVideo) {
      alert("Video must be under 50MB.");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-media")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("profile-media")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    const nextSort = media.length;

    const { data, error: insertError } = await supabase
      .from("profile_media")
      .insert({
        user_id: userId,
        media_url: publicUrl,
        media_type: type,
        caption: "",
        sort_order: nextSort,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert failed:", insertError.message);
      setUploading(false);
      return;
    }

    if (data) {
      setMedia((prev) => [
        ...prev,
        {
          id: data.id,
          userId: data.user_id,
          mediaUrl: data.media_url,
          mediaType: data.media_type,
          caption: data.caption ?? "",
          sortOrder: data.sort_order ?? 0,
          createdAt: new Date(data.created_at).getTime(),
        },
      ]);
    }

    setUploading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, "image");
    e.target.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, "video");
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const item = media.find((m) => m.id === id);
    if (!item) return;

    const filePath = item.mediaUrl.split("/profile-media/")[1];
    if (filePath) {
      await supabase.storage.from("profile-media").remove([filePath]);
    }

    await supabase.from("profile_media").delete().eq("id", id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
    setPreview(null);
  };

  const handleSaveCaption = async (id: string) => {
    await supabase.from("profile_media").update({ caption: captionValue }).eq("id", id);
    setMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, caption: captionValue } : m))
    );
    setEditingCaption(null);
  };

  const startEditCaption = (item: ProfileMedia) => {
    setEditingCaption(item.id);
    setCaptionValue(item.caption);
  };

  return (
    <div className="rounded-[10px] border border-[var(--glass-border)] bg-white p-6 shadow-sm dark:border-[var(--glass-border)] dark:glass-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-primary-c dark:text-primary-c">
          <ImageIcon className="h-4 w-4 text-accent-c" />
          Skill Showcase
        </h3>
        {editable && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl bg-accent-soft-c px-3 py-1.5 text-xs font-semibold text-accent-c transition-all hover:scale-105 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              Photo
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl bg-accent-soft-c px-3 py-1.5 text-xs font-semibold text-accent-c transition-all hover:scale-105 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Video className="h-3.5 w-3.5" />
              )}
              Video
            </button>
          </div>
        )}
      </div>

      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--glass-border)] py-12 text-center">
          <ImageIcon className="h-8 w-8 text-faint-c dark:text-faint-c" />
          <p className="mt-3 text-sm font-medium text-muted-c dark:text-muted-c">
            No showcase media yet
          </p>
          <p className="mt-1 text-xs text-faint-c dark:text-faint-c">
            {editable
              ? "Upload photos or videos showing off the skills you can teach."
              : "This user hasn't added any showcase media yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence>
            {media.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-input-bg)]"
              >
                {item.mediaType === "image" ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.caption || "Showcase"}
                    className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setPreview(item)}
                  />
                ) : (
                  <div
                    className="relative flex h-full w-full cursor-pointer items-center justify-center bg-black"
                    onClick={() => setPreview(item)}
                  >
                    <video
                      src={item.mediaUrl}
                      className="h-full w-full object-cover"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:opacity-0">
                      <Play className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}

                {editable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-danger-c"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                    <p className="truncate text-xs text-white">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {editable && media.length > 0 && (
        <p className="mt-3 text-xs text-faint-c dark:text-faint-c">
          Click a photo or video to view it. Hover and tap the X to remove it.
        </p>
      )}

      {/* Fullscreen preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => {
              setPreview(null);
              setEditingCaption(null);
            }}
          >
            <div
              className="relative max-h-[90vh] max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setPreview(null);
                  setEditingCaption(null);
                }}
                className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>

              {preview.mediaType === "image" ? (
                <img
                  src={preview.mediaUrl}
                  alt={preview.caption || "Showcase"}
                  className="max-h-[70vh] w-auto rounded-2xl object-contain"
                />
              ) : (
                <video
                  src={preview.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-auto rounded-2xl"
                />
              )}

              {editable ? (
                <div className="mt-4">
                  {editingCaption === preview.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={captionValue}
                        onChange={(e) => setCaptionValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveCaption(preview.id);
                          if (e.key === "Escape") setEditingCaption(null);
                        }}
                        placeholder="Add a caption..."
                        className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-white/50"
                      />
                      <button
                        onClick={() => handleSaveCaption(preview.id)}
                        className="rounded-xl bg-accent-c px-4 py-2 text-sm font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditCaption(preview)}
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {preview.caption || "Add a caption..."}
                    </button>
                  )}
                </div>
              ) : (
                preview.caption && (
                  <p className="mt-4 text-center text-sm text-white/80">{preview.caption}</p>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
