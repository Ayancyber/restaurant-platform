"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { restaurantConfig } from "@/config";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { brand } = restaurantConfig;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const SidebarContent = () => (
    <>
      <div className="border-b px-6 py-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {brand.name.charAt(0)}
          </div>
          <div className="leading-tight">
            <p className="font-heading font-semibold text-sm">
              {brand.name}
            </p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          View Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="flex flex-col h-full">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground hidden sm:block">
              Signed in as{" "}
              <span className="font-medium text-foreground">{userName}</span>
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Home className="h-4 w-4 mr-2" />
              Live Site
            </Link>
          </Button>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
