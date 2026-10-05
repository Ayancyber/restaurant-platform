"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ArrowUp,
  ArrowDown,
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

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export function CategoriesAdminClient({
  categories,
  itemCounts,
}: {
  categories: Category[];
  itemCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      sort_order: Number(formData.get("sort_order") || 0),
      is_active: formData.get("is_active") === "on",
    };

    const url = editing
      ? `/api/admin/categories/${editing.id}`
      : "/api/admin/categories";
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

      toast.success(editing ? "Category updated" : "Category created");
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cat: Category) {
    const count = itemCounts[cat.id] ?? 0;
    const msg =
      count > 0
        ? `This category has ${count} item(s). You must move/delete those first. Continue to try?`
        : `Delete "${cat.name}"? This cannot be undone.`;
    if (!confirm(msg)) return;

    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to delete");
        return;
      }
      toast.success("Category deleted");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(cat: Category) {
    setUpdatingId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function move(cat: Category, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const swap = categories[swapIdx];
    setUpdatingId(cat.id);

    try {
      await Promise.all([
        fetch(`/api/admin/categories/${cat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: swap.sort_order }),
        }),
        fetch(`/api/admin/categories/${swap.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: cat.sort_order }),
        }),
      ]);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"} •
            Order controls how they appear on the public menu
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </header>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No categories yet. Click &quot;Add Category&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const count = itemCounts[cat.id] ?? 0;
            return (
              <Card key={cat.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Reorder */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => move(cat, "up")}
                      disabled={idx === 0 || updatingId === cat.id}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => move(cat, "down")}
                      disabled={
                        idx === categories.length - 1 || updatingId === cat.id
                      }
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{cat.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {count} item{count === 1 ? "" : "s"}
                      </Badge>
                      {!cat.is_active && (
                        <Badge variant="destructive" className="text-xs">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      title={cat.is_active ? "Hide from site" : "Show on site"}
                      onClick={() => toggleActive(cat)}
                      disabled={updatingId === cat.id}
                    >
                      {updatingId === cat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : cat.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Categories group menu items. Sort order controls display.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Starters"
                defaultValue={editing?.name ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Appetizers and small plates"
                defaultValue={editing?.description ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? categories.length}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first.
              </p>
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
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
