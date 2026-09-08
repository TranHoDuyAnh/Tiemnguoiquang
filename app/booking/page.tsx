import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Phone, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/public/layout";
import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";
import { getBusinessHours, getDefaultBusinessHours } from "@/lib/data/hours";
import BookingForm from "./booking-form";
import { formatTime, getCurrentDayOfWeek, cn } from "@/lib/utils";
import { DAY_OF_WEEK_NAMES } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Đặt bàn | Tiệm Người Quảng",
  description: "Đặt bàn online tại Tiệm Người Quảng nhanh chóng và tiện lợi.",
};

export default async function BookingPage() {
  const business = await getBusinessBySlug(BUSINESS_SLUG);
  const settings = business ? await getBusinessSettings(business.id) : null;
  const hours = business ? await getBusinessHours(business.id) : getDefaultBusinessHours();
  const currentDay = getCurrentDayOfWeek();

  const bookingDisabled = settings && !settings.allow_booking;

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
              Đặt bàn
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-brown mb-4 tracking-tight">
              Đặt chỗ ngay
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              Điền thông tin bên dưới - chúng tôi sẽ liên hệ xác nhận nhanh nhất
              trong vòng 24 giờ.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 order-2 lg:order-1">
              {bookingDisabled ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                      <CalendarCheck className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-warm-brown mb-3">
                      Hệ thống đặt bàn tạm thời đóng
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Xin lỗi vì sự bất tiện này. Vui lòng gọi điện trực tiếp để
                      được hỗ trợ đặt chỗ nhanh nhất.
                    </p>
                    {business?.phone && (
                      <a href={`tel:${business.phone}`}>
                        <Badge variant="outline" className="text-base py-1.5 px-5 rounded-full border-green-500/30 text-green-700">
                          <Phone className="h-4 w-4 mr-2" />
                          {business.phone}
                        </Badge>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <BookingForm />
              )}
            </div>

            <div className="order-1 lg:order-2 space-y-5">
              <Card className="border-teal/10 bg-gradient-to-br from-teal/[0.03] to-transparent">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-warm-brown">
                        Giờ phục vụ
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Hôm nay:{" "}
                        {(() => {
                          const today = hours.find((h) => h.day_of_week === currentDay);
                          if (!today || !today.is_open) return "Đóng cửa";
                          return `${formatTime(today.open_time)} - ${formatTime(today.close_time)}`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {hours
                      .slice(1)
                      .concat(hours[0])
                      .slice(0, 4)
                      .map((h) => {
                        const isToday = h.day_of_week === currentDay;
                        return (
                          <div
                            key={h.day_of_week}
                            className={cn(
                              "flex justify-between items-center py-1.5 px-3 rounded-lg text-xs",
                              isToday ? "bg-white/60" : ""
                            )}
                          >
                            <span
                              className={cn(
                                "font-medium",
                                isToday ? "text-teal" : "text-warm-brown/70"
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
                                ? `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`
                                : "Đóng"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {business?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Hỗ trợ đặt bàn</div>
                        <a
                          href={`tel:${business.phone}`}
                          className="font-semibold text-warm-brown hover:text-teal transition-colors"
                        >
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <CalendarCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Phản hồi trong
                      </div>
                      <div className="font-semibold text-warm-brown">
                        24 giờ
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warm-brown to-teal text-white border-0">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-semibold mb-2">Lưu ý</h3>
                  <ul className="text-xs text-white/85 space-y-2 leading-relaxed">
                    <li>• Vui lòng đến đúng giờ hoặc sớm 10 phút.</li>
                    <li>• Quá 15 phút từ giờ đặt, bàn sẽ được ưu tiên cho khách khác.</li>
                    <li>• Đặt trên 10 khách, vui lòng gọi điện trực tiếp.</li>
                    <li>• Nếu cần hủy, thông báo sớm nhất có thể.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
