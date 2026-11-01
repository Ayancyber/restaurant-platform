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
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-border/70 pb-7">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">
            Menu management
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">
            Menu items<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground mt-3">
            Manage dishes, pricing and what guests see on your menu.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-full px-5 h-11">
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 border-y border-border/70">
        {[
          { label: "Total items", value: items.length },
          { label: "Available", value: items.filter((item) => item.is_available).length },
          { label: "Featured", value: items.filter((item) => item.is_featured).length },
          { label: "Categories", value: categories.length },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`py-5 px-4 ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b lg:border-b-0" : ""} ${index === 2 ? "lg:border-l" : ""} border-border/70`}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="font-heading text-3xl mt-2 tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Your menu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "dish" : "dishes"} in your collection
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Sorted by display order
        </span>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-20 text-center">
            <ImageOff className="h-8 w-8 mx-auto text-muted-foreground/60 mb-4" />
            <h3 className="font-heading text-xl">A menu waiting to be written.</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first dish to start building the menu.
            </p>
            <Button onClick={openNew} className="mt-6 rounded-full gap-2">
              <Plus className="h-4 w-4" /> Add your first item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y divide-border/70 border-y border-border/70">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-5"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="hidden sm:block text-xs tabular-nums text-muted-foreground/60 w-5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted/60 overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading text-xl sm:text-2xl leading-tight">
                      {item.name}
                    </h3>
                    {item.is_featured && (
                      <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider gap-1">
                        <Star className="h-3 w-3" /> Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-[0.13em] text-primary mt-2">
                    {categoriesById[item.category_id] ?? "Uncategorised"}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-2xl">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    {item.tags?.map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                    {!item.is_available && (
                      <span className="text-[10px] uppercase tracking-wider text-destructive font-semibold">
                        Currently unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-0 sm:pl-4">
                <span className="font-heading text-xl sm:text-2xl whitespace-nowrap tabular-nums">
                  {currency} {Number(item.price).toLocaleString()}
                </span>
                <div className="flex items-center gap-1 border-l border-border/70 pl-3 ml-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    title={item.is_available ? "Mark unavailable" : "Mark available"}
                    onClick={() => toggleField(item.id, "is_available", !item.is_available)}
                  >
                    {item.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    title={item.is_featured ? "Unfeature" : "Feature"}
                    onClick={() => toggleField(item.id, "is_featured", !item.is_featured)}
                  >
                    <Star className={`h-4 w-4 ${item.is_featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    title="Edit item"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    title="Delete item"
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
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Menu management
            </p>
            <DialogTitle className="font-heading text-2xl">
              {editing ? "Edit menu item" : "Add a menu item"}
            </DialogTitle>
            <DialogDescription>
              Add the details guests will see when browsing your menu.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label>Dish photography</Label>
              {previewUrl ? (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[16/9] rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
                  <ImageOff className="h-7 w-7" />
                  <span className="text-xs">No image selected</span>
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
                <div className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-full border border-border hover:bg-muted/60 text-sm font-medium">
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> {previewUrl ? "Replace image" : "Upload image"}</>
                  )}
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Item name *</Label>
              <Input id="name" name="name" required defaultValue={editing?.name ?? ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select name="category_id" required defaultValue={editing?.category_id ?? categories[0]?.id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={editing?.price ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={editing?.description ?? ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" placeholder="vegetarian, spicy" defaultValue={editing?.tags?.join(", ") ?? ""} />
                <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Display order</Label>
                <Input id="sort_order" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-border/70 py-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="is_available" defaultChecked={editing?.is_available ?? true} className="rounded" />
                Available to order
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="is_featured" defaultChecked={editing?.is_featured ?? false} className="rounded" />
                Featured item
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-full gap-2" disabled={submitting || uploading}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Create item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
