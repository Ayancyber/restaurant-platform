"use client";

import { useMemo, useState } from "react";

type AnalyticsPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

type StatusCount = {
  status: string;
  count: number;
};

type Props = {
  data: AnalyticsPoint[];
  statuses: StatusCount[];
  currency: string;
};

const statusStyles: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#d97706" },
  confirmed: { label: "Confirmed", color: "#3b82f6" },
  preparing: { label: "Preparing", color: "#ea580c" },
  ready: { label: "Ready", color: "#9333ea" },
  "out-for-delivery": { label: "Out for delivery", color: "#6366f1" },
  completed: { label: "Completed", color: "#16a34a" },
  cancelled: { label: "Cancelled", color: "#dc2626" },
};

export function DashboardAnalytics({ data, statuses, currency }: Props) {
  const [range, setRange] = useState<7 | 30>(7);
  const points = useMemo(() => data.slice(-range), [data, range]);

  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = points.reduce((sum, point) => sum + point.orders, 0);
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
  const maxOrders = Math.max(...points.map((point) => point.orders), 1);
  const totalStatusOrders = statuses.reduce((sum, item) => sum + item.count, 0);

  const chartWidth = 640;
  const chartHeight = 190;
  const chartPadding = 12;
  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? chartWidth / 2
        : chartPadding +
          (index / (points.length - 1)) * (chartWidth - chartPadding * 2);
    const y =
      chartHeight -
      16 -
      (point.revenue / maxRevenue) * (chartHeight - 42);

    return { x, y };
  });

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = coordinates.length
    ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${chartHeight - 16} L ${coordinates[0].x} ${chartHeight - 16} Z`
    : "";

  const formatMoney = (amount: number) =>
    `${currency} ${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Performance
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
            The numbers behind the service.
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenue and order activity over time.
          </p>
        </div>

        <div className="flex rounded-full border border-border bg-white p-1">
          {([7, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              aria-pressed={range === days}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                range === days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Paid revenue</p>
              <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                {formatMoney(totalRevenue)}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Last {range} days
            </span>
          </div>

          <div className="mt-7">
            {totalRevenue === 0 ? (
              <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
                No paid revenue recorded in this period.
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label={`Paid revenue trend over the last ${range} days`}
                className="h-[190px] w-full overflow-visible"
                preserveAspectRatio="none"
              >
                {[0, 1, 2, 3].map((step) => {
                  const y = 16 + step * 50;
                  return (
                    <line
                      key={step}
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#e9e4dc"
                      strokeDasharray="4 6"
                    />
                  );
                })}
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c2410c" stopOpacity=".2" />
                    <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#revenue-fill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#c2410c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {coordinates.map((point, index) => (
                  <circle
                    key={points[index].date}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#c2410c"
                    stroke="white"
                    strokeWidth="2"
                    aria-label={`${points[index].label}: ${formatMoney(points[index].revenue)}`}
                  />
                ))}
              </svg>
            )}
            <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
              <span>{points[0]?.label}</span>
              <span>{points[Math.floor((points.length - 1) / 2)]?.label}</span>
              <span>{points[points.length - 1]?.label}</span>
            </div>
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            Only orders marked as paid are included. Refunded and unpaid orders
            are excluded.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
          <p className="text-sm text-muted-foreground">Orders placed</p>
          <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            {totalOrders.toLocaleString("en-PK")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across the last {range} days
          </p>

          <div className="mt-8 flex h-[190px] items-end gap-2">
            {points.map((point) => (
              <div
                key={point.date}
                className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                title={`${point.label}: ${point.orders} orders`}
              >
                <div className="mb-2 text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {point.orders}
                </div>
                <div
                  className="w-full rounded-t-sm bg-[#d9c8b8] transition-colors group-hover:bg-primary"
                  style={{
                    height: `${Math.max((point.orders / maxOrders) * 100, point.orders > 0 ? 4 : 0)}%`,
                    minHeight: point.orders > 0 ? "4px" : "0",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
            <span>{points[0]?.label}</span>
            <span>{points[points.length - 1]?.label}</span>
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            Counts all orders placed, including cancelled orders.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Operations
            </p>
            <h3 className="mt-2 font-heading text-xl font-semibold">
              Order status
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              How orders are progressing.
            </p>
          </div>
          <p className="font-heading text-2xl font-semibold">
            {totalStatusOrders}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              orders
            </span>
          </p>
        </div>

        {totalStatusOrders === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No orders recorded in this period.
          </p>
        ) : (
          <>
            <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-[#eee9e1]">
              {statuses.map((item) => (
                <div
                  key={item.status}
                  title={`${statusStyles[item.status]?.label ?? item.status}: ${item.count}`}
                  style={{
                    width: `${(item.count / totalStatusOrders) * 100}%`,
                    backgroundColor:
                      statusStyles[item.status]?.color ?? "#a8a29e",
                  }}
                />
              ))}
            </div>
            <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {statuses.map((item) => {
                const style = statusStyles[item.status] ?? {
                  label: item.status,
                  color: "#a8a29e",
                };
                return (
                  <div key={item.status} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />
                    <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                      {style.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
