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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground mt-1">
            {images.length} images •{" "}
            {images.filter((i) => i.is_active).length} active
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </header>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ImageOff className="h-10 w-10" />
              <p>No images yet. Click "Add Image" to upload one.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <Card key={img.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                <img
                  src={img.image_url}
                  alt={img.title ?? ""}
                  className="h-full w-full object-cover"
                />
                {!img.is_active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive">Hidden</Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => toggleActive(img.id, !img.is_active)}
                    title={img.is_active ? "Hide" : "Show"}
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
                    className="h-8 w-8"
                    onClick={() => openEdit(img)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {img.title && (
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{img.title}</p>
                  {img.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {img.description}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Image" : "Add Image"}
            </DialogTitle>
            <DialogDescription>
              Upload an image and add details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Image *</Label>
              {previewUrl ? (
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md border bg-background hover:bg-muted text-sm font-medium cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {previewUrl ? "Replace Image" : "Upload Image"}
                    </>
                  )}
                </div>
              </label>
              <p className="text-xs text-muted-foreground">
                Max 5MB • JPG, PNG, WEBP, GIF
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Signature Pasta"
                defaultValue={editing?.title ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 0}
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={editing?.is_active ?? true}
                className="rounded"
              />
              Show on public site
            </label>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={submitting || uploading}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Add Image"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
