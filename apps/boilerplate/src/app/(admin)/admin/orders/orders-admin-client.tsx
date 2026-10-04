"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  Phone,
  MapPin,
  Loader2,
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

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "completed"
  | "cancelled";

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
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
  ready: { label: "Ready", icon: Package, color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
  "out-for-delivery": { label: "Out for Delivery", icon: Truck, color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-green-500/10 text-green-700 border-green-500/20" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500/10 text-red-700 border-red-500/20" },
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
      return orders.filter(
        (o) => !["completed", "cancelled"].includes(o.status)
      );
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

  const activeCount = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  ).length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">
          {orders.length} total • {activeCount} active • {pendingCount} pending
        </p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="preparing">Preparing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No orders in this view.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order) => {
            const config = statusConfig[order.status];
            const Icon = config.icon;
            const orderItems = itemsByOrder[order.id] ?? [];

            return (
              <Card key={order.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-semibold text-sm">
                          {order.order_number}
                        </span>
                        <Badge variant="outline" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {order.type}
                        </Badge>
                        <Badge
                          variant={order.payment_status === "paid" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {order.payment_status}
                        </Badge>
                        {order.customer_marked_paid_at && order.payment_status === "unpaid" && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                            Customer Says Paid
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("en-PK", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="font-medium">{order.customer_name}</span>
                        <span className="text-muted-foreground">
                          {order.customer_phone}
                        </span>
                        <span className="text-muted-foreground">
                          {orderItems.reduce((s, i) => s + i.quantity, 0)} items
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-primary whitespace-nowrap">
                        {currency} {Number(order.total).toLocaleString()}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>

                      <Select
                        value={order.status}
                        onValueChange={(v) =>
                          updateStatus(order.id, v as OrderStatus)
                        }
                        disabled={updating === order.id}
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

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order {selectedOrder.order_number}
                  {updating === selectedOrder.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  {new Date(selectedOrder.created_at).toLocaleString("en-PK")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="font-medium flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="h-3 w-3" />
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <p className="font-medium">{selectedOrder.customer_email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium capitalize">{selectedOrder.type}</p>
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Delivery Address
                    </p>
                    <p className="text-sm mt-1">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="font-medium mb-3">Items</p>
                  <ul className="space-y-2">
                    {(itemsByOrder[selectedOrder.id] ?? []).map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between text-sm gap-3"
                      >
                        <div className="flex gap-2">
                          <Badge variant="secondary">{item.quantity}×</Badge>
                          <span>{item.item_name}</span>
                        </div>
                        <span className="whitespace-nowrap">
                          {currency} {Number(item.line_total).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {currency} {Number(selectedOrder.subtotal).toLocaleString()}
                    </span>
                  </div>
                  {Number(selectedOrder.delivery_fee) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>
                        {currency}{" "}
                        {Number(selectedOrder.delivery_fee).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">
                      {currency} {Number(selectedOrder.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground text-xs">Notes</p>
                    <p className="text-sm mt-1 italic">
                      "{selectedOrder.notes}"
                    </p>
                  </div>
                )}

                {selectedOrder.payment_status === "unpaid" && (
                    <Button
                      onClick={() => markPaid(selectedOrder.id)}
                      disabled={updating === selectedOrder.id}
                      className="w-full gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
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
