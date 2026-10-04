"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Trash2,
  Eye,
  Phone,
  Loader2,
  Inbox,
  CircleDot,
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
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          {messages.length} total • {unreadCount} unread
        </p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">Read ({readCount})</TabsTrigger>
          <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Inbox className="h-10 w-10" />
              <p>
                {filter === "unread"
                  ? "No unread messages. You're all caught up!"
                  : "No messages in this view."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((msg) => (
            <Card
              key={msg.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !msg.is_read ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => openMessage(msg)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!msg.is_read && (
                        <CircleDot className="h-3 w-3 text-primary fill-primary" />
                      )}
                      <span
                        className={
                          msg.is_read ? "text-muted-foreground" : "font-medium"
                        }
                      >
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.email}
                      </span>
                    </div>
                    {msg.subject && (
                      <p
                        className={`text-sm ${
                          msg.is_read ? "" : "font-medium"
                        }`}
                      >
                        {msg.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(msg.id, !msg.is_read);
                      }}
                      disabled={updating === msg.id}
                      title={msg.is_read ? "Mark unread" : "Mark read"}
                    >
                      {msg.is_read ? (
                        <MailOpen className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg.id);
                      }}
                      disabled={updating === msg.id}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {new Date(selected.created_at).toLocaleString("en-PK")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {selected.subject && (
                  <div>
                    <p className="text-muted-foreground text-xs">Subject</p>
                    <p className="font-medium mt-1">{selected.subject}</p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {selected.phone}
                    </a>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-xs mb-2">Message</p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <a href={`mailto:${selected.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reply via Email
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selected.id)}
                    disabled={updating === selected.id}
                    className="gap-2"
                  >
                    {updating === selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
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
