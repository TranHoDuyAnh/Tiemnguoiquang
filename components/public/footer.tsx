import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
} from "lucide-react";
import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";
import { getBusinessHours, getDefaultBusinessHours } from "@/lib/data/hours";
import { formatTime } from "@/lib/utils";
import { DAY_OF_WEEK_NAMES } from "@/lib/types";

export async function PublicFooter() {
  const business = await getBusinessBySlug(BUSINESS_SLUG);
  const settings = business ? await getBusinessSettings(business.id) : null;
  const hours = business ? await getBusinessHours(business.id) : getDefaultBusinessHours();

  const currentDay = new Date().getDay();

  return (
    <footer className="border-t border-border/50 bg-white mt-24">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {business?.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  width={48}
                  height={48}
                  className="rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center text-white font-bold font-display text-lg">
                  {(business?.name || "TNQ").slice(0, 2)}
                </div>
              )}
              <span className="font-display text-xl font-semibold text-warm-brown">
                {business?.name || "Tiệm Người Quảng"}
              </span>
            </div>
            {business?.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {business.description}
              </p>
            )}
            <div className="flex items-center gap-3 pt-2">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-teal hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-teal hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-teal hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-warm-brown mb-4">
              Điều hướng
            </h3>
            <nav className="space-y-2.5">
              <Link href="/menu" className="block text-sm text-muted-foreground hover:text-teal">
                Thực đơn
              </Link>
              <Link href="/#about" className="block text-sm text-muted-foreground hover:text-teal">
                Về chúng tôi
              </Link>
              <Link href="/location" className="block text-sm text-muted-foreground hover:text-teal">
                Địa chỉ
              </Link>
              <Link href="/booking" className="block text-sm text-muted-foreground hover:text-teal">
                Đặt bàn
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-teal">
                Liên hệ
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-warm-brown mb-4">
              Liên hệ
            </h3>
            <div className="space-y-3">
              {business?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-teal shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {[business.address, business.city, business.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {business?.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-teal"
                >
                  <Phone className="h-4 w-4 text-teal" />
                  <span>{business.phone}</span>
                </a>
              )}
              {business?.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-teal"
                >
                  <Mail className="h-4 w-4 text-teal" />
                  <span>{business.email}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-warm-brown mb-4">
              Giờ mở cửa
            </h3>
            <div className="space-y-1.5">
              {hours.slice(1).concat(hours[0]).map((h) => (
                <div
                  key={h.day_of_week}
                  className={`flex justify-between items-center text-sm ${
                    h.day_of_week === currentDay
                      ? "text-teal font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {h.day_of_week === currentDay && (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {DAY_OF_WEEK_NAMES[h.day_of_week]}
                  </span>
                  <span>
                    {h.is_open && h.open_time && h.close_time
                      ? `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`
                      : "Đóng cửa"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {business?.name || "Tiệm Người Quảng"}. Mọi quyền được bảo lưu.
          </p>
          <div className="text-xs text-muted-foreground">
            Được chế biến với ❤️ tại Việt Nam
          </div>
        </div>
      </div>
    </footer>
  );
}
