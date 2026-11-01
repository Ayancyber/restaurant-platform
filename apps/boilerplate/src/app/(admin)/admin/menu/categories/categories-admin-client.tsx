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
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Menu management / Structure
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
            Categories<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Organise your menu into clear sections. Their order determines how
            guests discover your dishes.
          </p>
        </div>

        <Button onClick={openNew} className="h-11 gap-2 self-start px-5 sm:self-auto">
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-4 border-b border-border/70 pb-7 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total categories
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums">
            {String(categories.length).padStart(2, "0")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Visible on site
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums">
            {String(categories.filter((cat) => cat.is_active).length).padStart(2, "0")}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Menu items assigned
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums">
            {String(Object.values(itemCounts).reduce((sum, count) => sum + count, 0)).padStart(2, "0")}
          </p>
        </div>
      </section>

      {categories.length === 0 ? (
        <div className="border-y border-border/70 py-20 text-center">
          <span className="font-heading text-5xl text-primary/40">01</span>
          <h2 className="mt-5 font-heading text-2xl">A menu takes shape here.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Create your first category to give your menu a clear structure.
          </p>
          <Button onClick={openNew} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Create first category
          </Button>
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Category order
            </p>
            <p className="text-xs text-muted-foreground">
              {categories.length} {categories.length === 1 ? "section" : "sections"}
            </p>
          </div>

          <div className="divide-y divide-border/70 border-y border-border/70">
            {categories.map((cat, idx) => {
              const count = itemCounts[cat.id] ?? 0;
              const busy = updatingId === cat.id;

              return (
                <article
                  key={cat.id}
                  className="group grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 py-5 sm:grid-cols-[54px_minmax(0,1fr)_auto] sm:gap-5"
                >
                  <div className="font-heading text-2xl tabular-nums text-primary/65 sm:text-3xl">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <h2 className="truncate font-heading text-xl font-medium sm:text-2xl">
                        {cat.name}
                      </h2>
                      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {count} {count === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {cat.description ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {cat.description}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs italic text-muted-foreground/65">
                        No description added
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          cat.is_active ? "bg-emerald-600" : "bg-muted-foreground/40"
                        }`}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {cat.is_active ? "Visible on site" : "Hidden from site"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="mr-1 flex flex-col sm:mr-2 sm:flex-row">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => move(cat, "up")}
                        disabled={idx === 0 || busy}
                        title="Move up"
                        aria-label={`Move ${cat.name} up`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => move(cat, "down")}
                        disabled={idx === categories.length - 1 || busy}
                        title="Move down"
                        aria-label={`Move ${cat.name} down`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      title={cat.is_active ? "Hide from site" : "Show on site"}
                      aria-label={cat.is_active ? `Hide ${cat.name}` : `Show ${cat.name}`}
                      onClick={() => toggleActive(cat)}
                      disabled={busy}
                    >
                      {busy ? (
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
                      className="h-9 w-9"
                      onClick={() => openEdit(cat)}
                      title="Edit category"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      title="Delete category"
                      aria-label={`Delete ${cat.name}`}
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Use the arrows to change the order in which categories appear on your public menu.
          </p>
        </section>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md gap-6">
          <DialogHeader>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Menu structure
            </p>
            <DialogTitle className="font-heading text-2xl font-medium">
              {editing ? "Refine category" : "Create a category"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {editing
                ? "Update the details and presentation of this menu section."
                : "Give your menu a new section for guests to explore."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Category name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Starters"
                defaultValue={editing?.name ?? ""}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="A short introduction to this section..."
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
                defaultValue={editing?.sort_order ?? categories.length}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear earlier on the public menu.
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
                  Make this category visible to your guests.
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
              <Button type="submit" className="h-11 flex-1 gap-2" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Create category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
