"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type GalleryImage = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export function GalleryAdminClient({
  images,
}: {
  images: GalleryImage[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setPreviewUrl("");
    setDialogOpen(true);
  }

  function openEdit(img: GalleryImage) {
    setEditing(img);
    setPreviewUrl(img.image_url);
    setDialogOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Upload failed");
        return;
      }
      setPreviewUrl(result.url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!previewUrl) {
      toast.error("Please upload an image first");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: previewUrl,
      sort_order: Number(formData.get("sort_order") || 0),
      is_active: formData.get("is_active") === "on",
    };

    const url = editing
      ? `/api/admin/gallery/${editing.id}`
      : "/api/admin/gallery";
    const method = editing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to save");
        return;
      }
      toast.success(editing ? "Image updated" : "Image added");
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to delete");
        return;
      }
      toast.success("Image deleted");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(id: string, is_active: boolean) {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Visual identity / Photography
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
            The gallery<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Curate the images that tell your restaurant's story, one frame at a time.
          </p>
        </div>

        <Button onClick={openNew} className="h-11 gap-2 self-start px-5 sm:self-auto">
          <Plus className="h-4 w-4" />
          Add image
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-4 border-b border-border/70 pb-7 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total images
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums">
            {String(images.length).padStart(2, "0")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Published
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums">
            {String(images.filter((img) => img.is_active).length).padStart(2, "0")}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Hidden
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums">
            {String(images.filter((img) => !img.is_active).length).padStart(2, "0")}
          </p>
        </div>
      </section>

      {images.length === 0 ? (
        <div className="border-y border-border/70 py-20 text-center">
          <ImageOff className="mx-auto h-9 w-9 text-primary/50" strokeWidth={1.2} />
          <h2 className="mt-5 font-heading text-2xl">Every story begins with a frame.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Add your first photograph to start building your restaurant's visual collection.
          </p>
          <Button onClick={openNew} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Upload first image
          </Button>
        </div>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Image collection
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length} {images.length === 1 ? "frame" : "frames"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <article key={img.id} className="group min-w-0">
                <div
                  className={`relative overflow-hidden bg-muted ${
                    idx % 5 === 0
                      ? "aspect-[4/5]"
                      : idx % 5 === 1
                        ? "aspect-[5/4]"
                        : idx % 5 === 2
                          ? "aspect-square"
                          : idx % 5 === 3
                            ? "aspect-[4/5]"
                            : "aspect-[5/4]"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.title ?? "Gallery photograph"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />

                  <div className="absolute left-3 top-3">
                    <span className="bg-background/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-foreground backdrop-blur-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {!img.is_active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <span className="border border-white/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                        Hidden from site
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 shadow-sm"
                      onClick={() => toggleActive(img.id, !img.is_active)}
                      title={img.is_active ? "Hide from site" : "Show on site"}
                      aria-label={img.is_active ? "Hide image" : "Show image"}
                    >
                      {img.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 shadow-sm"
                      onClick={() => openEdit(img)}
                      title="Edit image"
                      aria-label="Edit image"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-9 w-9 shadow-sm"
                      onClick={() => handleDelete(img.id)}
                      disabled={deletingId === img.id}
                      title="Delete image"
                      aria-label="Delete image"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 border-b border-border/70 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-heading text-lg font-medium">
                      {img.title || "Untitled image"}
                    </h2>
                    {img.description ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {img.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs italic text-muted-foreground/65">
                        No description
                      </p>
                    )}
                  </div>
                  <span className="mt-1 flex shrink-0 items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        img.is_active ? "bg-emerald-600" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {img.is_active ? "Live" : "Hidden"}
                    </span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg gap-6 overflow-y-auto">
          <DialogHeader>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Visual collection
            </p>
            <DialogTitle className="font-heading text-2xl font-medium">
              {editing ? "Refine photograph" : "Add a photograph"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Upload an image and give it a little context for your guests.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Image *</Label>

              {previewUrl ? (
                <div className="relative aspect-[5/3] overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Selected image preview"
                    className="h-full w-full object-contain"
                  />
                  <span className="absolute bottom-3 left-3 bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm">
                    Preview
                  </span>
                </div>
              ) : (
                <div className="flex aspect-[5/3] flex-col items-center justify-center border border-dashed border-border bg-muted/30 text-muted-foreground">
                  <ImageOff className="h-8 w-8" strokeWidth={1.2} />
                  <p className="mt-3 text-sm">Your photograph will appear here</p>
                </div>
              )}

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="inline-flex h-11 w-full items-center justify-center gap-2 border border-border bg-background text-sm font-medium transition-colors hover:bg-muted">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {previewUrl ? "Replace photograph" : "Choose photograph"}
                    </>
                  )}
                </span>
              </label>
              <p className="text-xs text-muted-foreground">
                Maximum 5MB · JPG, PNG, WEBP or GIF
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Image title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. A signature dish"
                defaultValue={editing?.title ?? ""}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Add a short description..."
                defaultValue={editing?.description ?? ""}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Display order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 0}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear earlier in the public gallery.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 border-y border-border/70 py-4 text-sm">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={editing?.is_active ?? true}
                className="h-4 w-4 rounded accent-primary"
              />
              <span>
                <span className="block font-medium">Show on public site</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Make this photograph visible to your guests.
                </span>
              </span>
            </label>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 flex-1 gap-2"
                disabled={submitting || uploading}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Add image"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
