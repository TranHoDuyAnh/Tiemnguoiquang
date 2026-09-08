import Link from "next/link";
import { PublicNavbar } from "./navbar";
import { PublicFooter } from "./footer";
import type { Business } from "@/lib/types";

interface PublicLayoutProps {
  children: React.ReactNode;
  business: Business | null;
}

export function PublicLayout({ children, business }: PublicLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <PublicNavbar business={business} />
      <main className="flex-1">{children}</main>
      <Link
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-warm-brown focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Đi lên đầu trang
      </Link>
      <PublicFooter />
    </div>
  );
}
