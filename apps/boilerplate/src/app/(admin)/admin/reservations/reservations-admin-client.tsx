"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  Users,
  XCircle,
  CalendarDays,
  Phone,
  Mail,
  Eye,
  Loader2,
  UserCheck,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "cancelled"
  | "no-show";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  special_requests: string | null;
  created_at: string;
};

const statusConfig: Record<
  ReservationStatus,
  { label: string; icon: typeof Clock; color: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  seated: {
    label: "Seated",
    icon: UserCheck,
    color: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500/10 text-red-700 border-red-500/20",
  },
  "no-show": {
    label: "No-show",
    icon: XCircle,
    color: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  },
};

export function ReservationsAdminClient({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"upcoming" | "all" | ReservationStatus>(
    "upcoming"
  );
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    if (filter === "all") return reservations;
    if (filter === "upcoming") {
      return reservations.filter(
        (r) => r.reservation_date >= today && r.status !== "cancelled"
      );
    }
    return reservations.filter((r) => r.status === filter);
  }, [reservations, filter, today]);

  async function updateStatus(id: string, status: ReservationStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error || "Failed to update");
        return;
      }
      toast.success(`Reservation ${statusConfig[status].label.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  }

  const upcomingCount = reservations.filter(
    (r) => r.reservation_date >= today && r.status !== "cancelled"
  ).length;
  const pendingCount = reservations.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground mt-1">
          {reservations.length} total • {upcomingCount} upcoming •{" "}
          {pendingCount} pending
        </p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="flex-wrap h-auto bg-transparent">
          <TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="seated">Seated</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="no-show">No-show</TabsTrigger>
          <TabsTrigger value="all">All ({reservations.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card className="mt-[72px]">
          <CardContent className="py-16 text-center text-muted-foreground">
            No reservations in this view.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 mt-[72px]">
          {filtered.map((reservation) => {
            const config = statusConfig[reservation.status];
            const Icon = config.icon;
            const isPast = reservation.reservation_date < today;

            return (
              <Card
                key={reservation.id}
                className={isPast ? "opacity-70" : ""}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">
                          {reservation.customer_name}
                        </span>
                        <Badge variant="outline" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Users className="h-3 w-3" />
                          {reservation.party_size}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(reservation.reservation_date).toLocaleDateString(
                            "en-PK",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reservation.reservation_time.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {reservation.customer_phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(reservation)}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>

                      <Select
                        value={reservation.status}
                        onValueChange={(v) =>
                          updateStatus(reservation.id, v as ReservationStatus)
                        }
                        disabled={updating === reservation.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>
                              {cfg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Reservation — {selected.customer_name}
                  {updating === selected.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  Requested on{" "}
                  {new Date(selected.created_at).toLocaleString("en-PK")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">
                      {new Date(selected.reservation_date).toLocaleDateString(
                        "en-PK",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Time</p>
                    <p className="font-medium">
                      {selected.reservation_time.slice(0, 5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Party Size</p>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {selected.party_size} guests
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge
                      variant="outline"
                      className={statusConfig[selected.status].color}
                    >
                      {statusConfig[selected.status].label}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <a
                    href={`tel:${selected.customer_phone}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                    {selected.customer_phone}
                  </a>
                  {selected.customer_email && (
                    <a
                      href={`mailto:${selected.customer_email}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      {selected.customer_email}
                    </a>
                  )}
                </div>

                {selected.special_requests && (
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground text-xs">
                      Special Requests
                    </p>
                    <p className="mt-1 italic">"{selected.special_requests}"</p>
                  </div>
                )}

                <div className="border-t pt-4 flex gap-2">
                  {selected.status === "pending" && (
                    <Button
                      onClick={() => {
                        updateStatus(selected.id, "confirmed");
                        setSelected(null);
                      }}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm
                    </Button>
                  )}
                  {selected.status === "confirmed" && (
                    <Button
                      onClick={() => {
                        updateStatus(selected.id, "seated");
                        setSelected(null);
                      }}
                      className="flex-1 gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Mark Seated
                    </Button>
                  )}
                  {!["cancelled", "seated"].includes(selected.status) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateStatus(selected.id, "cancelled");
                        setSelected(null);
                      }}
                      className="flex-1 gap-2 text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
