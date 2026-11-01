import Link from "next/link";
import {
  ShoppingBag,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { restaurantConfig } from "@/config";
import { DashboardAnalytics } from "./dashboard-analytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { currency } = restaurantConfig;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCDate(startDate.getUTCDate() - 29);

  const [
    ordersRes,
    pendingRes,
    reservationsRes,
    messagesRes,
    revenueRes,
    chartOrdersRes,
  ] = await Promise.all([
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
    supabase
      .from("orders")
      .select("created_at, total, payment_status, status")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const revenue = (revenueRes.data ?? []).reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const dailyData = new Map<
    string,
    { revenue: number; orders: number }
  >();

  for (let offset = 0; offset < 30; offset++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + offset);
    dailyData.set(date.toISOString().slice(0, 10), {
      revenue: 0,
      orders: 0,
    });
  }

  const statusCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    "out-for-delivery": 0,
    completed: 0,
    cancelled: 0,
  };

  for (const order of chartOrdersRes.data ?? []) {
    const dateKey = new Date(order.created_at).toISOString().slice(0, 10);
    const day = dailyData.get(dateKey);

    if (day) {
      day.orders += 1;
      if (order.payment_status === "paid") {
        day.revenue += Number(order.total || 0);
      }
    }

    if (order.status in statusCounts) {
      statusCounts[order.status] += 1;
    }
  }

  const analyticsData = Array.from(dailyData.entries()).map(
    ([date, values]) => ({
      date,
      label: (() => {
        const [, month, day] = date.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${Number(day)} ${months[Number(month) - 1]}`;
      })(),
      ...values,
    })
  );

  const statusOrder = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out-for-delivery",
    "completed",
    "cancelled",
  ];

  const analyticsStatuses = statusOrder.map((status) => ({
    status,
    count: statusCounts[status],
  }));

  const stats = [
    {
      label: "Total Orders",
      value: (ordersRes.count ?? 0).toLocaleString("en-PK"),
      hint: `${pendingRes.count ?? 0} pending`,
      icon: ShoppingBag,
      href: "/admin/orders",
      index: "01",
    },
    {
      label: "Pending Reservations",
      value: (reservationsRes.count ?? 0).toLocaleString("en-PK"),
      hint: "Awaiting confirmation",
      icon: CalendarDays,
      href: "/admin/reservations",
      index: "02",
    },
    {
      label: "Unread Messages",
      value: (messagesRes.count ?? 0).toLocaleString("en-PK"),
      hint: "Contact form",
      icon: MessageSquare,
      href: "/admin/messages",
      index: "03",
    },
    {
      label: "Paid Revenue",
      value: `${currency} ${revenue.toLocaleString("en-PK")}`,
      hint: "From all paid orders",
      icon: TrendingUp,
      href: "/admin/orders",
      index: "04",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Restaurant operations
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Dashboard<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear view of what is happening across your restaurant.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const pakistanDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);
              const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              return `${weekdays[pakistanDate.getUTCDay()]}, ${pakistanDate.getUTCDate()} ${months[pakistanDate.getUTCMonth()]} ${pakistanDate.getUTCFullYear()}`;
            })()}
          </p>
        </div>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            At a glance
          </p>
          <span className="text-xs text-muted-foreground">All time</span>
        </div>

        <div className="grid gap-0 border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className={`group relative flex min-h-[156px] flex-col justify-between py-5 transition-colors hover:bg-white sm:px-5 ${
                  index > 0 ? "border-t border-border sm:border-l" : ""
                } ${index === 2 ? "lg:border-l" : ""} ${
                  index === 1 ? "sm:border-t-0" : ""
                } ${index === 2 || index === 3 ? "lg:border-t-0" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground/60">
                    {stat.index}
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stat.hint}
                    </p>
                  </div>
                  <Icon className="mb-1 h-5 w-5 text-primary/70" />
                </div>
                <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </section>

      <DashboardAnalytics
        data={analyticsData}
        statuses={analyticsStatuses}
        currency={currency}
      />

      <section className="border-t border-border pt-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Shortcuts
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">
            Where would you like to go?
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/menu"
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Manage Menu <span className="ml-2">↗</span>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium transition-colors hover:border-primary"
          >
            View Orders <span className="ml-2">↗</span>
          </Link>
          <Link
            href="/admin/gallery"
            className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium transition-colors hover:border-primary"
          >
            Manage Gallery <span className="ml-2">↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
