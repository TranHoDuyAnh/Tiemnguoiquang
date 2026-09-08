import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/public/layout";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getBusinessHours, getDefaultBusinessHours } from "@/lib/data/hours";
import { formatTime, getCurrentDayOfWeek, cn } from "@/lib/utils";
import { DAY_OF_WEEK_NAMES } from "@/lib/types";
import ContactForm from "./contact-form";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Liên hệ | Tiệm Người Quảng",
  description: "Liên hệ Tiệm Người Quảng - đặt bàn, hợp tác, góp ý.",
};

export default async function ContactPage() {
  const business = await getBusinessBySlug(BUSINESS_SLUG);
  const hours = business ? await getBusinessHours(business.id) : getDefaultBusinessHours();
  const currentDay = getCurrentDayOfWeek();

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
              Liên hệ
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-brown mb-4 tracking-tight">
              Nói chuyện với chúng tôi
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              Có câu hỏi, góp ý, hay muốn hợp tác? Hãy gửi tin nhắn - chúng tôi
              luôn sẵn sàng lắng nghe.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="h-full">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-11 h-11 rounded-2xl bg-teal/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-warm-brown">
                        Gửi tin nhắn
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Phản hồi trong 24 giờ
                      </p>
                    </div>
                  </div>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            <div className="order-1 lg:order-2 space-y-5">
              <Card>
                <CardContent className="p-5 sm:p-6 space-y-5">
                  {business?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Điện thoại
                        </div>
                        <a
                          href={`tel:${business.phone}`}
                          className="font-semibold text-warm-brown hover:text-teal transition-colors text-lg"
                        >
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {business?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Email
                        </div>
                        <a
                          href={`mailto:${business.email}`}
                          className="font-semibold text-warm-brown hover:text-teal transition-colors break-all"
                        >
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {business?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-teal" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Địa chỉ
                        </div>
                        <p className="font-medium text-warm-brown leading-relaxed">
                          {[business.address, business.city, business.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-teal/10 bg-gradient-to-br from-teal/[0.03] to-transparent">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-warm-brown text-lg">
                        Giờ mở cửa
                      </h3>
                      {(() => {
                        const today = hours.find(
                          (h) => h.day_of_week === currentDay
                        );
                        return (
                          <p className="text-xs text-muted-foreground">
                            {today?.is_open
                              ? `Đang mở cửa đến ${formatTime(today.close_time)}`
                              : "Hôm nay đóng cửa"}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {hours
                      .slice(1)
                      .concat(hours[0])
                      .map((h) => {
                        const isToday = h.day_of_week === currentDay;
                        return (
                          <div
                            key={h.day_of_week}
                            className={cn(
                              "flex justify-between items-center py-1.5 px-3 rounded-lg text-sm",
                              isToday ? "bg-white/60" : ""
                            )}
                          >
                            <span
                              className={cn(
                                "font-medium",
                                isToday
                                  ? "text-teal"
                                  : "text-warm-brown/70"
                              )}
                            >
                              {DAY_OF_WEEK_NAMES[h.day_of_week]}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                !h.is_open && "text-muted-foreground",
                                isToday ? "text-teal" : "text-warm-brown/60"
                              )}
                            >
                              {h.is_open && h.open_time && h.close_time
                                ? `${formatTime(h.open_time)} - ${formatTime(
                                    h.close_time
                                  )}`
                                : "Đóng"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
