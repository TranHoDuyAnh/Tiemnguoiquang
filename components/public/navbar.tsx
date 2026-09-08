"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Business } from "@/lib/types";

const NAV_LINKS = [
  { href: "/#menu", label: "Thực đơn" },
  { href: "/#about", label: "Về chúng tôi" },
  { href: "/location", label: "Địa chỉ" },
  { href: "/contact", label: "Liên hệ" },
];

interface PublicNavbarProps {
  business: Business | null;
}

export function PublicNavbar({ business }: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-cream/90 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {business?.logo_url ? (
            <Image
              src={business.logo_url}
              alt={business.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-teal flex items-center justify-center text-white font-bold font-display">
              {(business?.name || "TNQ").slice(0, 2)}
            </div>
          )}
          <span className="font-display text-lg font-semibold text-warm-brown">
            {business?.name || "Tiệm Người Quảng"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-warm-brown/80 hover:text-teal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {business?.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">{business.phone}</span>
            </a>
          )}
          <Link href="/booking">
            <Button size="sm" className="rounded-full">
              Đặt bàn
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-warm-brown"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-cream animate-fade-in">
          <div className="container mx-auto py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-warm-brown/90 hover:bg-accent/50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {business?.address && (
              <div className="flex items-start gap-2 px-4 py-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-sm">{business.address}</span>
              </div>
            )}
            {business?.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-teal"
              >
                <Phone className="h-4 w-4" />
                <span>{business.phone}</span>
              </a>
            )}
            <div className="pt-2 px-4">
              <Link href="/booking" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-full">Đặt bàn</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
