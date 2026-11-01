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
  Tags,
  LogOut,
  Menu,
  Home,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, exact: true },
      { href: "/admin/menu/categories", label: "Categories", icon: Tags, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

export function AdminShell({
  children,
  userName,
  brandName,
  brandLogoUrl,
}: {
  children: React.ReactNode;
  userName: string;
  brandName: string;
  brandLogoUrl: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const isActive = (item: (typeof allNavItems)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const currentPage =
    allNavItems.find(isActive)?.label ?? "Workspace";

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col bg-[#f7f4ee]">
        <div className="border-b border-[#e7e0d5] px-6 py-7">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9472d] p-1 font-heading text-lg text-white">
              {brandLogoUrl && brandLogoUrl !== "/logo.svg" ? (
                <img
                  src={brandLogoUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                brandName.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold tracking-tight text-[#29251f]">
                {brandName}
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#92897d]">
                Management
              </p>
            </div>
          </Link>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex-1 overflow-y-auto px-4 py-7"
        >
          {navGroups.map((group) => (
            <div key={group.label} className="mb-8 last:mb-0">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a49a8d]">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] transition-all duration-200",
                          active
                            ? "bg-white font-semibold text-[#a9472d] shadow-[0_2px_12px_rgba(48,37,25,0.045)]"
                            : "text-[#746c61] hover:bg-white/70 hover:text-[#29251f]"
                        )}
                      >
                        {active && (
                          <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#a9472d]" />
                        )}
                        <Icon
                          className={cn(
                            "h-[17px] w-[17px] shrink-0 transition-colors",
                            active
                              ? "text-[#a9472d]"
                              : "text-[#9b9184] group-hover:text-[#746c61]"
                          )}
                          strokeWidth={1.7}
                        />
                        <span>{item.label}</span>
                        {active && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#b87965]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#e7e0d5] p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] text-[#746c61] transition-colors hover:bg-white/70 hover:text-[#29251f]"
          >
            <Home className="h-[17px] w-[17px] text-[#9b9184]" strokeWidth={1.7} />
            <span>View website</span>
            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#a49a8d]" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] text-[#8b6258] transition-colors hover:bg-[#f0e5df] hover:text-[#a9472d]"
          >
            <LogOut className="h-[17px] w-[17px]" strokeWidth={1.7} />
            Sign out
          </button>
          <div className="mt-4 border-t border-[#e7e0d5] px-3 pt-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#aaa092]">
              Restaurant workspace
            </p>
            <p className="mt-1 truncate text-xs text-[#81786c]">
              {brandName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#29251f]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-[#e7e0d5] md:block">
        <SidebarContent />
      </aside>

      <div className="min-h-screen md:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#ebe6de] bg-[#fbfaf7]/95 px-4 backdrop-blur-md sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-[#746c61] hover:bg-[#f0ece5]"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] border-r border-[#e7e0d5] bg-[#f7f4ee] p-0"
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.17em] text-[#a49a8d] sm:flex">
                <span>Workspace</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#a9472d]">{currentPage}</span>
              </div>
              <p className="truncate font-heading text-lg font-medium tracking-tight text-[#29251f] sm:mt-1 sm:text-xl">
                {currentPage}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 text-xs font-medium text-[#746c61] transition-colors hover:text-[#a9472d] sm:flex"
            >
              View live site
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <div className="hidden h-7 w-px bg-[#e7e0d5] sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5d9ca] bg-[#f1e9df] text-[11px] font-semibold text-[#8e4a36]">
                {initials || "A"}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[160px] truncate text-xs font-semibold text-[#39332b]">
                  {userName}
                </p>
                <p className="mt-0.5 text-[10px] text-[#a49a8d]">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
