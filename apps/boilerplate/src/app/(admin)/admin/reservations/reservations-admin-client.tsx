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
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  seated: {
    label: "Seated",
    icon: UserCheck,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200",
  },
  "no-show": {
    label: "No-show",
    icon: XCircle,
    color: "bg-slate-100 text-slate-600 border-slate-200",
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
  const confirmedCount = reservations.filter(
    (r) => r.status === "confirmed"
  ).length;

  const filters: {
    value: "upcoming" | "all" | ReservationStatus;
    label: string;
    count?: number;
  }[] = [
    { value: "upcoming", label: "Upcoming", count: upcomingCount },
    { value: "pending", label: "Pending", count: pendingCount },
    { value: "confirmed", label: "Confirmed", count: confirmedCount },
    { value: "seated", label: "Seated" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no-show", label: "No-show" },
    { value: "all", label: "All", count: reservations.length },
  ];

  const formatDate = (date: string, long = false) =>
    new Date(date).toLocaleDateString("en-PK", {
      weekday: long ? "long" : "short",
      day: "numeric",
      month: long ? "long" : "short",
      year: "numeric",
    });

  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div className="space-y-9">
      <header className="border-b border-border pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Operations / Guest bookings
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Reservations<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear view of every table booking and the guests behind it.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {reservations.length.toLocaleString("en-PK")} records
          </span>
        </div>
      </header>

      <section className="grid grid-cols-2 border-y border-border sm:grid-cols-4">
        {[
          {
            label: "Total bookings",
            value: reservations.length,
            note: "All received requests",
          },
          {
            label: "Upcoming",
            value: upcomingCount,
            note: "Not yet cancelled",
          },
          {
            label: "Awaiting action",
            value: pendingCount,
            note: "Pending confirmation",
          },
          {
            label: "Confirmed",
            value: confirmedCount,
            note: "Ready for guests",
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`py-5 ${
              index % 2 === 0 ? "pr-4" : "pl-4"
            } ${
              index > 1 ? "border-t border-border sm:border-t-0" : ""
            } ${
              index > 0 ? "sm:border-l sm:border-border sm:px-5" : ""
            }`}
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">
              {stat.value.toLocaleString("en-PK")}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stat.note}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Guest register
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              Manage reservations
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length} of {reservations.length}
          </span>
        </div>

        <Tabs
          value={filter}
          onValueChange={(value) =>
            setFilter(value as "upcoming" | "all" | ReservationStatus)
          }
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
            {filters.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {item.label}
                {item.count !== undefined && (
                  <span className="ml-1.5 tabular-nums text-muted-foreground">
                    ({item.count})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div className="mt-8 border-y border-border py-20 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <h3 className="mt-4 font-heading text-xl font-semibold">
              No reservations here.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no bookings matching this view.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {filtered.map((reservation, index) => {
              const config = statusConfig[reservation.status];
              const Icon = config.icon;
              const isPast = reservation.reservation_date < today;

              return (
                <article
                  key={reservation.id}
                  className={`py-5 transition-colors hover:bg-white/70 sm:px-3 ${
                    isPast ? "opacity-65" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <span className="hidden pt-1 text-xs tabular-nums text-muted-foreground/50 sm:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {reservation.customer_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`gap-1 rounded-full font-medium ${config.color}`}
                          >
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="gap-1 rounded-full border-border text-xs font-normal"
                          >
                            <Users className="h-3 w-3" />
                            {reservation.party_size} guests
                          </Badge>
                          {isPast && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Past date
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(reservation.reservation_date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(reservation.reservation_time)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {reservation.customer_phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-3 lg:border-0 lg:pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(reservation)}
                        className="h-9 gap-1.5 rounded-full px-4"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>

                      <Select
                        value={reservation.status}
                        onValueChange={(value) =>
                          updateStatus(
                            reservation.id,
                            value as ReservationStatus
                          )
                        }
                        disabled={updating === reservation.id}
                      >
                        <SelectTrigger className="h-9 w-[155px] rounded-full bg-white text-xs">
                          {updating === reservation.id && (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          )}
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
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-border bg-[#fbfaf7] p-0">
          {selected && (
            <>
              <div className="border-b border-border px-6 py-6 sm:px-8">
                <DialogHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Reservation details
                  </p>
                  <DialogTitle className="mt-2 font-heading text-2xl font-semibold">
                    {selected.customer_name}
                  </DialogTitle>
                  <DialogDescription>
                    Requested on{" "}
                    {new Date(selected.created_at).toLocaleString("en-PK")}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <Badge
                    variant="outline"
                    className={`rounded-full ${statusConfig[selected.status].color}`}
                  >
                    {statusConfig[selected.status].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6 sm:px-8">
                <section className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Reservation date
                    </p>
                    <p className="mt-1 font-medium">
                      {formatDate(selected.reservation_date, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Reservation time
                    </p>
                    <p className="mt-1 font-medium">
                      {formatTime(selected.reservation_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Party size</p>
                    <p className="mt-1 flex items-center gap-1.5 font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {selected.party_size} guests
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1 font-medium">
                      {statusConfig[selected.status].label}
                    </p>
                  </div>
                </section>

                <section className="space-y-3 border-t border-border pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Guest contact
                  </p>
                  <a
                    href={`tel:${selected.customer_phone}`}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selected.customer_phone}
                  </a>
                  {selected.customer_email && (
                    <a
                      href={`mailto:${selected.customer_email}`}
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selected.customer_email}
                    </a>
                  )}
                </section>

                {selected.special_requests && (
                  <section className="border-t border-border pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Special requests
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      {selected.special_requests}
                    </p>
                  </section>
                )}

                <section className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
                  {selected.status === "pending" && (
                    <Button
                      onClick={() => {
                        updateStatus(selected.id, "confirmed");
                        setSelected(null);
                      }}
                      className="h-10 flex-1 rounded-full"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm reservation
                    </Button>
                  )}
                  {selected.status === "confirmed" && (
                    <Button
                      onClick={() => {
                        updateStatus(selected.id, "seated");
                        setSelected(null);
                      }}
                      className="h-10 flex-1 rounded-full"
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Mark as seated
                    </Button>
                  )}
                  {!["cancelled", "seated"].includes(selected.status) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateStatus(selected.id, "cancelled");
                        setSelected(null);
                      }}
                      className="h-10 flex-1 rounded-full text-destructive hover:text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel reservation
                    </Button>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
