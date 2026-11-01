"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Clock, ChefHat, CheckCircle2, XCircle, Truck,
  Eye, Phone, MapPin, Loader2, ArrowUpRight, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type OrderStatus =
  | "pending" | "confirmed" | "preparing" | "ready"
  | "out-for-delivery" | "completed" | "cancelled";

type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  type: "pickup" | "delivery" | "dine-in";
  status: OrderStatus;
  payment_method: "jazzcash" | "easypaisa" | "cod";
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string | null;
  notes: string | null;
  customer_marked_paid_at: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-orange-50 text-orange-700 border-orange-200" },
  ready: { label: "Ready", icon: Package, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "out-for-delivery": { label: "Out for Delivery", icon: Truck, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
};

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  unpaid: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-600 border-slate-200",
};

export function OrdersAdminClient({
  orders,
  items,
  currency,
}: {
  orders: Order[];
  items: OrderItem[];
  currency: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"active" | "all" | OrderStatus>("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((o) => !["completed", "cancelled"].includes(o.status));
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const itemsByOrder = useMemo(() => {
    const map: Record<string, OrderItem[]> = {};
    items.forEach((item) => {
      if (!map[item.order_id]) map[item.order_id] = [];
      map[item.order_id].push(item);
    });
    return map;
  }, [items]);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error || "Failed to update");
        return;
      }
      toast.success(`Order marked as ${statusConfig[status].label}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  }

  async function markPaid(id: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: "paid" }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      toast.success("Marked as paid");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  }

  const activeCount = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const paidCount = orders.filter((o) => o.payment_status === "paid").length;

  const stats = [
    { label: "Total orders", value: orders.length, note: "All received orders" },
    { label: "Active orders", value: activeCount, note: "Currently in progress" },
    { label: "Awaiting action", value: pendingCount, note: "Pending confirmation" },
    { label: "Paid orders", value: paidCount, note: "Payment received" },
  ];

  const money = (value: number) =>
    `${currency} ${Number(value).toLocaleString("en-PK")}`;

  return (
    <div className="space-y-9">
      <header className="border-b border-border pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Operations / Fulfilment
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Orders<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every order, from the first click to the final delivery.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {orders.length.toLocaleString("en-PK")} records
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 border-y border-border sm:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`py-5 ${index % 2 ? "pl-4 sm:pl-5" : "pr-4"} ${
              index > 1 ? "border-t border-border sm:border-t-0" : ""
            } ${index > 0 ? "sm:border-l sm:border-border sm:px-5" : ""}`}
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">
              {stat.value.toLocaleString("en-PK")}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Order register
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              Manage incoming orders
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length} of {orders.length}
          </span>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Pending
            </TabsTrigger>
            <TabsTrigger value="preparing" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Preparing
            </TabsTrigger>
            <TabsTrigger value="ready" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Ready
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent px-3 py-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
              All ({orders.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div className="mt-8 border-y border-border py-20 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <h3 className="mt-4 font-heading text-xl font-semibold">No orders here.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no orders matching this view.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {filtered.map((order, index) => {
              const config = statusConfig[order.status];
              const Icon = config.icon;
              const orderItems = itemsByOrder[order.id] ?? [];
              const quantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <article key={order.id} className="py-5 transition-colors hover:bg-white/70 sm:px-3">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <span className="hidden pt-1 text-xs tabular-nums text-muted-foreground/50 sm:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold">
                            {order.order_number}
                          </span>
                          <Badge variant="outline" className={`gap-1 rounded-full font-medium ${config.color}`}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className={`rounded-full text-[10px] capitalize ${paymentStyles[order.payment_status]}`}>
                            {order.payment_status}
                          </Badge>
                          {order.customer_marked_paid_at && order.payment_status === "unpaid" && (
                            <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-[10px] text-blue-700">
                              Customer says paid
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className="font-medium">{order.customer_name}</span>
                          <span className="text-muted-foreground">{order.customer_phone}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="capitalize">{order.type}</span>
                          <span>·</span>
                          <span>{quantity} items</span>
                          <span>·</span>
                          <span>{new Date(order.created_at).toLocaleString("en-PK", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 lg:border-0 lg:pt-0">
                      <span className="font-heading text-lg font-semibold whitespace-nowrap">
                        {money(order.total)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="h-9 gap-1.5 rounded-full px-4"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatus(order.id, value as OrderStatus)}
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="h-9 w-[155px] rounded-full bg-white text-xs">
                            {updating === order.id ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-border bg-[#fbfaf7] p-0">
          {selectedOrder && (
            <>
              <div className="border-b border-border px-6 py-6 sm:px-8">
                <DialogHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Order details
                  </p>
                  <DialogTitle className="mt-2 font-heading text-2xl font-semibold">
                    {selectedOrder.order_number}
                  </DialogTitle>
                  <DialogDescription>
                    {new Date(selectedOrder.created_at).toLocaleString("en-PK")}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className={`rounded-full ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                  <Badge variant="outline" className={`rounded-full capitalize ${paymentStyles[selectedOrder.payment_status]}`}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6 sm:px-8">
                <section className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedOrder.customer_phone}`} className="mt-1 flex items-center gap-1 font-medium hover:text-primary">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="mt-1 font-medium">{selectedOrder.customer_email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Order type</p>
                    <p className="mt-1 font-medium capitalize">{selectedOrder.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payment method</p>
                    <p className="mt-1 font-medium uppercase">{selectedOrder.payment_method}</p>
                  </div>
                </section>

                {selectedOrder.delivery_address && (
                  <section className="border-t border-border pt-5">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> Delivery address
                    </p>
                    <p className="mt-2 text-sm">{selectedOrder.delivery_address}</p>
                  </section>
                )}

                <section className="border-t border-border pt-5">
                  <h3 className="font-heading text-lg font-semibold">Order items</h3>
                  <ul className="mt-4 space-y-3">
                    {(itemsByOrder[selectedOrder.id] ?? []).map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                        <div className="flex min-w-0 gap-3">
                          <span className="text-xs tabular-nums text-muted-foreground">{item.quantity}×</span>
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {money(item.unit_price)} each
                            </p>
                          </div>
                        </div>
                        <span className="whitespace-nowrap font-medium">{money(item.line_total)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2 border-t border-border pt-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{money(selectedOrder.subtotal)}</span>
                  </div>
                  {Number(selectedOrder.delivery_fee) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>{money(selectedOrder.delivery_fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span className="font-heading text-xl text-primary">{money(selectedOrder.total)}</span>
                  </div>
                </section>

                {selectedOrder.notes && (
                  <section className="border-t border-border pt-5">
                    <p className="text-xs text-muted-foreground">Customer notes</p>
                    <p className="mt-2 text-sm italic">"{selectedOrder.notes}"</p>
                  </section>
                )}

                {selectedOrder.payment_status === "unpaid" && (
                  <Button
                    onClick={() => markPaid(selectedOrder.id)}
                    disabled={updating === selectedOrder.id}
                    className="h-11 w-full rounded-full"
                  >
                    {updating === selectedOrder.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Mark as Paid
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
