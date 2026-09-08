import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Navigation,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/public/layout";
import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";
import { getBusinessHours, getDefaultBusinessHours } from "@/lib/data/hours";
import { DAY_OF_WEEK_NAMES } from "@/lib/types";
import { cn, formatTime, getCurrentDayOfWeek } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Địa chỉ | Tiệm Người Quảng",
  description: "Tìm Tiệm Người Quảng - địa chỉ, giờ mở cửa, số điện thoại.",
};

export default async function LocationPage() {
  const business = await getBusinessBySlug(BUSINESS_SLUG);
  const settings = business ? await getBusinessSettings(business.id) : null;
  const hours = business ? await getBusinessHours(business.id) : getDefaultBusinessHours();
  const currentDay = getCurrentDayOfWeek();

  const mapsUrl = (() => {
    if (settings?.google_maps_url) return settings.google_maps_url;
    if (business?.latitude && business?.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
    }
    if (business?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        business.address
      )}`;
    }
    return null;
  })();

  return (
    <PublicLayout business={business}>
      <section className="relative border-b border-border/50 bg-gradient-to-b from-soft-teal/5 to-transparent">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Link>
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-teal/30 text-teal"
            >
              Địa chỉ
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-brown mb-4 tracking-tight">
              Ghé thăm chúng tôi
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              Tiệm Người Quảng chào đón bạn mỗi ngày với không gian ấm cúng và những
              món ăn ngon đậm đà hương vị miền Trung.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {business?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-6 w-6 text-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-warm-brown text-lg mb-1">
                          Địa chỉ
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {[business.address, business.city, business.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {business.latitude && business.longitude && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/80">
                            <span className="font-mono bg-muted px-2 py-0.5 rounded-md">
                              {business.latitude.toFixed(5)}, {business.longitude.toFixed(5)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {business?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-warm-brown text-lg mb-1">
                          Điện thoại
                        </h3>
                        <a
                          href={`tel:${business.phone}`}
                          className="text-muted-foreground hover:text-teal transition-colors"
                        >
                          {business.phone}
                        </a>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Gọi đặt bàn hoặc hỏi giờ mở cửa
                        </p>
                      </div>
                    </div>
                  )}

                  {business?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-warm-brown text-lg mb-1">
                          Email
                        </h3>
                        <a
                          href={`mailto:${business.email}`}
                          className="text-muted-foreground hover:text-teal transition-colors break-all"
                        >
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {business?.website_url && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                        <Globe className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-warm-brown text-lg mb-1">
                          Website
                        </h3>
                        <a
                          href={business.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-teal transition-colors"
                        >
                          {business.website_url.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}

                  {mapsUrl && (
                    <div className="pt-2">
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button
                          size="lg"
                          className="w-full rounded-full shadow-sm"
                        >
                          <Navigation className="mr-2 h-5 w-5" />
                          Mở Google Maps &amp; chỉ đường
                        </Button>
                      </a>
                      <p className="text-xs text-muted-foreground/70 mt-2 text-center">
                        Mở app Maps để chỉ đường từ vị trí của bạn đến quán
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-warm-brown text-lg">
                        Giờ mở cửa
                      </h3>
                      {(() => {
                        const today = hours.find((h) => h.day_of_week === currentDay);
                        return (
                          <p className="text-sm text-muted-foreground">
                            {today?.is_open
                              ? `Hôm nay ${formatTime(today.open_time)} - ${formatTime(today.close_time)}`
                              : "Hôm nay đóng cửa"}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {hours.slice(1).concat(hours[0]).map((h) => {
                      const isToday = h.day_of_week === currentDay;
                      return (
                        <div
                          key={h.day_of_week}
                          className={cn(
                            "flex justify-between items-center py-2 px-3 rounded-lg text-sm",
                            isToday ? "bg-teal/5" : ""
                          )}
                        >
                          <span
                            className={cn(
                              "font-medium",
                              isToday
                                ? "text-teal"
                                : "text-warm-brown/80"
                            )}
                          >
                            {DAY_OF_WEEK_NAMES[h.day_of_week]}
                          </span>
                          <span
                            className={cn(
                              "font-medium",
                              !h.is_open ? "text-muted-foreground" : "",
                              isToday ? "text-teal" : "text-warm-brown/70"
                            )}
                          >
                            {h.is_open && h.open_time && h.close_time
                              ? `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`
                              : "Đóng cửa"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <Card className="h-full overflow-hidden min-h-[500px] lg:min-h-[700px]">
                {business?.latitude && business?.longitude ? (
                  <div className="flex flex-col h-full">
                    <iframe
                      title="Bản đồ Tiệm Người Quảng"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        business.address || business.name || "Tiệm Người Quảng"
                      )}+%40${business.latitude},${business.longitude}&z=17&output=embed&t=m`}
                      width="100%"
                      className="w-full flex-1 min-h-[400px] lg:min-h-[560px] border-0"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    {business?.address && (
                      <div className="px-5 py-4 border-t border-border/50 bg-warm-brown/[0.02] space-y-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                          <p className="text-sm text-warm-brown font-medium leading-relaxed">
                            {[business.address, business.city, business.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                        {business?.phone && (
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <a
                              href={`tel:${business.phone}`}
                              className="text-sm text-muted-foreground hover:text-teal transition-colors"
                            >
                              {business.phone}
                            </a>
                          </div>
                        )}
                        <div className="pt-1 flex flex-wrap gap-2">
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="rounded-full h-9">
                                <Navigation className="mr-1.5 h-4 w-4" />
                                Chỉ đường
                              </Button>
                            </a>
                          )}
                          {business?.phone && (
                            <a href={`tel:${business.phone}`}>
                              <Button size="sm" variant="outline" className="rounded-full h-9 border-green-200 text-green-700 hover:bg-green-50">
                                <Phone className="mr-1.5 h-4 w-4" />
                                Gọi ngay
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : settings?.google_maps_url ? (
                  <div className="h-full min-h-[500px] lg:min-h-[700px] flex flex-col">
                    <div className="relative flex-1 min-h-[400px]">
                      {business?.cover_image_url ? (
                        <Image
                          src={business.cover_image_url}
                          alt={business.name}
                          fill
                          className="object-cover opacity-60"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-teal/30 via-soft-teal/20 to-warm-brown/30" />
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center mb-5 shadow-lg">
                          <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-display text-3xl font-bold text-warm-brown mb-3">
                          {business?.name || "Tiệm Người Quảng"}
                        </h3>
                        {business?.address && (
                          <p className="text-warm-brown/80 max-w-md mb-6">
                            {[business.address, business.city].filter(Boolean).join(", ")}
                          </p>
                        )}
                        <a href={settings.google_maps_url} target="_blank" rel="noopener noreferrer">
                          <Button size="lg" className="rounded-full">
                            <Navigation className="mr-2 h-5 w-5" />
                            Chỉ đường ngay
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[500px] lg:min-h-[700px] flex flex-col">
                    <div className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-teal/10 via-soft-teal/5 to-warm-brown/10">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
                          <MapPin className="h-10 w-10 text-teal" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-warm-brown mb-3">
                          Đang cập nhật bản đồ
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Vui lòng liên hệ qua số điện thoại để biết chi tiết địa chỉ.
                        </p>
                        {business?.phone && (
                          <a href={`tel:${business.phone}`} className="mt-5 inline-block">
                            <Button variant="outline" className="rounded-full mt-6">
                              <Phone className="mr-2 h-4 w-4" />
                              {business.phone}
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {mapsUrl && business?.latitude && business?.longitude && (
                <div className="text-xs text-muted-foreground/70 text-center">
                  Nếu vị trí chưa chính xác, hãy bấm nút &ldquo;Mở Google Maps &amp; chỉ đường&rdquo; ở trên và kiểm tra lại kinh độ/vĩ độ trong quản trị &gt; Cơ sở.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
