"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Loader2,
  Inbox,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function MessagesAdminClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"unread" | "all" | "read">("unread");
  const [selected, setSelected] = useState<Message | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return messages;
    if (filter === "unread") return messages.filter((m) => !m.is_read);
    return messages.filter((m) => m.is_read);
  }, [messages, filter]);

  async function toggleRead(id: string, is_read: boolean) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      toast.success(is_read ? "Marked as read" : "Marked as unread");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete");
        return;
      }
      toast.success("Message deleted");
      setSelected(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  }

  function openMessage(msg: Message) {
    setSelected(msg);
    if (!msg.is_read) {
      toggleRead(msg.id, true);
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const readCount = messages.length - unreadCount;

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Workspace / Correspondence
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
            Correspondence<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A place for every conversation with your guests.
          </p>
        </div>

        <div className="flex gap-7 self-start sm:self-auto">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Total
            </p>
            <p className="mt-1 font-heading text-3xl tabular-nums">
              {String(messages.length).padStart(2, "0")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Unread
            </p>
            <p className="mt-1 font-heading text-3xl tabular-nums text-primary">
              {String(unreadCount).padStart(2, "0")}
            </p>
          </div>
        </div>
      </header>

      <section>
        <div className="flex flex-col gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Your inbox
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "unread"
                ? "Messages waiting for your attention"
                : filter === "read"
                  ? "Previously opened conversations"
                  : "All guest conversations"}
            </p>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as "unread" | "all" | "read")}>
            <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0 sm:w-auto">
              <TabsTrigger
                value="unread"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Unread <span className="ml-1 tabular-nums">{unreadCount}</span>
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Read <span className="ml-1 tabular-nums">{readCount}</span>
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                All <span className="ml-1 tabular-nums">{messages.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filtered.length === 0 ? (
          <div className="border-b border-border/70 py-20 text-center">
            <Inbox className="mx-auto h-9 w-9 text-primary/50" strokeWidth={1.2} />
            <h2 className="mt-5 font-heading text-2xl">
              {filter === "unread" ? "You're all caught up." : "A quiet inbox."}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {filter === "unread"
                ? "There are no unread conversations waiting for you."
                : "There are no messages in this view just yet."}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((msg, idx) => (
              <article
                key={msg.id}
                role="button"
                tabIndex={0}
                onClick={() => openMessage(msg)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openMessage(msg);
                  }
                }}
                className={`group grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-border/70 py-5 transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6 ${
                  !msg.is_read ? "bg-primary/[0.025]" : ""
                }`}
              >
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <div className="flex w-7 shrink-0 flex-col items-center pt-1">
                    <span className="text-[10px] tabular-nums text-muted-foreground/70">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    { !msg.is_read && (
                      <CircleDot className="mt-3 h-3 w-3 fill-primary text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className={`truncate text-sm ${msg.is_read ? "font-medium" : "font-semibold"}`}>
                        {msg.name}
                      </h2>
                      <span className="truncate text-xs text-muted-foreground">
                        {msg.email}
                      </span>
                    </div>

                    <p className={`truncate text-sm ${msg.is_read ? "text-foreground/80" : "font-semibold"}`}>
                      {msg.subject || "No subject"}
                    </p>
                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-auto sm:justify-end sm:self-start">
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(msg.id, !msg.is_read);
                      }}
                      disabled={updating === msg.id}
                      title={msg.is_read ? "Mark unread" : "Mark read"}
                      aria-label={msg.is_read ? "Mark unread" : "Mark read"}
                    >
                      {updating === msg.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : msg.is_read ? (
                        <MailOpen className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg.id);
                      }}
                      disabled={updating === msg.id}
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl gap-6 overflow-y-auto">
          {selected && (
            <>
              <DialogHeader className="border-b border-border/70 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Guest correspondence
                </p>
                <DialogTitle className="font-heading text-2xl font-medium">
                  {selected.subject || "A message from your guest"}
                </DialogTitle>
                <DialogDescription>
                  Received{" "}
                  {new Date(selected.created_at).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      From
                    </p>
                    <p className="mt-1 font-heading text-xl">{selected.name}</p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {selected.email}
                    </a>
                    {selected.phone && (
                      <a
                        href={`tel:${selected.phone}`}
                        className="mt-1 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {selected.phone}
                      </a>
                    )}
                  </div>

                  <span className="shrink-0 border border-border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {selected.is_read ? "Read" : "Unread"}
                  </span>
                </div>

                <div className="border-y border-border/70 py-6">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Message
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                    {selected.message}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-11 flex-1 gap-2">
                    <a href={`mailto:${selected.email}`}>
                      <Mail className="h-4 w-4" />
                      Reply via email
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selected.id)}
                    disabled={updating === selected.id}
                    className="h-11 gap-2"
                  >
                    {updating === selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete message
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
