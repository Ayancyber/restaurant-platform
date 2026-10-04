"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  sort_order: number;
};

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  tags: string[] | null;
  sort_order: number;
};

export function MenuAdminClient({
  categories,
  items,
  currency,
}: {
  categories: Category[];
  items: MenuItem[];
  currency: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  function openNew() {
    setEditing(null);
    setPreviewUrl("");
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setPreviewUrl(item.image_url ?? "");
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
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      category_id: formData.get("category_id") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      image_url: previewUrl || "",
      is_available: formData.get("is_available") === "on",
      is_featured: formData.get("is_featured") === "on",
      tags,
      sort_order: Number(formData.get("sort_order") || 0),
    };

    const url = editing
      ? `/api/admin/menu/${editing.id}`
      : "/api/admin/menu";
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
        setSubmitting(false);
        return;
      }

      toast.success(editing ? "Item updated" : "Item created");
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
    if (!confirm("Delete this menu item?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to delete");
        return;
      }
      toast.success("Item deleted");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleField(
    id: string,
    field: "is_available" | "is_featured",
    value: boolean
  ) {
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error || "Failed to update");
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  }

  const categoriesById = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} items across {categories.length} categories
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No menu items yet. Click "Add Item" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.is_featured && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="h-3 w-3" /> Featured
                      </Badge>
                    )}
                    {!item.is_available && (
                      <Badge variant="destructive" className="text-xs">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {categoriesById[item.category_id] ?? "Unknown"}
                    {item.tags && item.tags.length > 0 && (
                      <>
                        {" • "}
                        {item.tags.join(", ")}
                      </>
                    )}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-medium text-primary whitespace-nowrap">
                    {currency} {Number(item.price).toLocaleString()}
                  </span>

                  <Button
                    size="icon"
                    variant="ghost"
                    title={item.is_available ? "Mark unavailable" : "Mark available"}
                    onClick={() =>
                      toggleField(item.id, "is_available", !item.is_available)
                    }
                  >
                    {item.is_available ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    title={item.is_featured ? "Unfeature" : "Feature"}
                    onClick={() =>
                      toggleField(item.id, "is_featured", !item.is_featured)
                    }
                  >
                    <Star
                      className={`h-4 w-4 ${
                        item.is_featured ? "fill-yellow-500 text-yellow-500" : ""
                      }`}
                    />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Image</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                name="category_id"
                required
                defaultValue={editing?.category_id ?? categories[0]?.id}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editing?.price ?? ""}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="vegetarian, spicy"
                defaultValue={editing?.tags?.join(", ") ?? ""}
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  defaultChecked={editing?.is_available ?? true}
                  className="rounded"
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={editing?.is_featured ?? false}
                  className="rounded"
                />
                Featured
              </label>
            </div>

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
                {editing ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
