import Link from "next/link";
import {
  ShoppingBag,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { restaurantConfig } from "@/config";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { currency } = restaurantConfig;

  const [ordersRes, pendingRes, reservationsRes, messagesRes, revenueRes] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase.from("orders").select("total").eq("payment_status", "paid"),
    ]);

  const revenue = (revenueRes.data ?? []).reduce(
    (sum, o) => sum + Number(o.total || 0),
    0
  );

  const stats = [
    {
      label: "Total Orders",
      value: ordersRes.count ?? 0,
      hint: `${pendingRes.count ?? 0} pending`,
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Pending Reservations",
      value: reservationsRes.count ?? 0,
      hint: "Awaiting confirmation",
      icon: CalendarDays,
      href: "/admin/reservations",
    },
    {
      label: "Unread Messages",
      value: messagesRes.count ?? 0,
      hint: "Contact form",
      icon: MessageSquare,
      href: "/admin/messages",
    },
    {
      label: "Paid Revenue",
      value: `${currency} ${revenue.toLocaleString()}`,
      hint: "From paid orders",
      icon: TrendingUp,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back — here's what's happening.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.hint}
                </p>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2"
                >
                  <Link href={stat.href}>
                    View <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/menu">Manage Menu</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/gallery">Manage Gallery</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
