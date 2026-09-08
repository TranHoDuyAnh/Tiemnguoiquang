"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderKanban,
  CalendarClock,
  MessageSquare,
  Store,
  Clock,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "Thực đơn", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Danh mục", icon: FolderKanban },
  { href: "/admin/bookings", label: "Đặt bàn", icon: CalendarClock },
  { href: "/admin/messages", label: "Tin nhắn", icon: MessageSquare },
  { href: "/admin/business", label: "Thông tin", icon: Store },
  { href: "/admin/hours", label: "Giờ mở cửa", icon: Clock },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

interface AdminShellProps {
  children: React.ReactNode;
  businessName: string | null;
  profileName: string | null | undefined;
  userEmail: string | null | undefined;
}

export default function AdminShell({
  children,
  businessName,
  profileName,
  userEmail,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      /* noop */
    }
    // full browser nav guarantees clean cookie + RSC state
    window.setTimeout(() => {
      window.location.assign("/admin/login");
    }, 100);
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center text-white font-bold font-display text-sm">
            {(businessName || "TNQ").slice(0, 2)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">
              {businessName || "Tiệm Người Quảng"}
            </div>
            <div className="text-[11px] text-white/50">Admin Panel</div>
          </div>
        </Link>
        <button
          className="lg:hidden text-white/70 hover:text-white p-1"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Quản lý
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 h-5 w-5",
                  isActive ? "text-teal" : "text-white/50 group-hover:text-white/80"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 text-teal" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Xem trang chủ</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 ml-auto opacity-50">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed inset-y-0 z-40 bg-warm-brown border-r border-white/5">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-warm-brown shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-warm-brown hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-sm text-gray-500 hidden sm:block">
                {pathname === "/admin"
                  ? "Dashboard"
                  : NAV_ITEMS.find((i) =>
                      i.exact
                        ? pathname === i.href
                        : pathname.startsWith(i.href)
                    )?.label || ""}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-9 pl-1.5 pr-3 hover:bg-gray-100">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-teal text-white text-xs font-semibold">
                        {profileName || userEmail
                          ? getInitials(profileName || userEmail)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {profileName || userEmail?.split("@")[0] || "Admin"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5">
                      <div className="text-sm font-medium text-gray-900">
                        {profileName || "Admin"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {userEmail || ""}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Separator className="hidden" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed inset-y-0 z-40 bg-warm-brown" />
      <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
