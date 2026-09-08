import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MenuCard,
  MENU_CARD_SKELETONS,
  BENEFITS,
} from "@/components/public/menu-card";
import { PublicLayout } from "@/components/public/layout";
import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";
import { getFeaturedMenuItems } from "@/lib/data/menu";
import { getBusinessHours, getDefaultBusinessHours } from "@/lib/data/hours";
import { DAY_OF_WEEK_NAMES } from "@/lib/types";
import { cn, formatTime, getCurrentDayOfWeek } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const business = await getBusinessBySlug(BUSINESS_SLUG);
  const settings = business ? await getBusinessSettings(business.id) : null;
  const featuredItems = business
    ? await getFeaturedMenuItems(business.id, 6)
    : [];
  const hours = business ? await getBusinessHours(business.id) : getDefaultBusinessHours();
  const currentDay = getCurrentDayOfWeek();

  return (
    <PublicLayout business={business}>
      <div id="top" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-soft-teal/10 via-transparent to-teal/10 pointer-events-none" />
        <div className="container mx-auto px-4 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full text-xs border-teal/40 text-teal bg-teal/5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                Đang phục vụ
              </Badge>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-warm-brown leading-[1.05] tracking-tight text-balance">
                {business?.name || "Tiệm Người Quảng"}
                <br />
                <span className="text-teal italic">Mì Quảng</span> &amp;
                hương vị miền Trung
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                {business?.description ||
                  "Chuyên Mì Quảng và các món ăn đặc sản miền Trung với hương vị truyền thống, nguyên liệu tươi ngon và tình yêu dành cho ẩm thực Quảng Nam."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/menu">
                  <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                    Xem thực đơn
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 w-full sm:w-auto border-warm-brown/20 hover:bg-warm-brown/5"
                  >
                    Đặt bàn
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {["#C4653A", "#E8A87C", "#2D1F14"].map((c, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-cream flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: c }}
                    >
                      {["M", "Q", "T"][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-warm-brown">500+</span> khách hài lòng
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                {business?.cover_image_url ? (
                  <Image
                    src={business.cover_image_url}
                    alt={business.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal via-soft-teal to-warm-brown flex items-center justify-center">
                    <div className="text-center text-white/90 p-8">
                      <div className="font-display text-6xl mb-4 italic">Mì Quảng</div>
                      <div className="text-lg opacity-80">Hương vị Quảng Nam</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white rounded-2xl shadow-xl p-4 max-w-[240px] border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Hôm nay</div>
                    <div className="text-sm font-semibold text-warm-brown">
                      {(() => {
                        const today = hours.find((h) => h.day_of_week === currentDay);
                        if (!today || !today.is_open || !today.open_time || !today.close_time)
                          return "Đóng cửa";
                        return `${formatTime(today.open_time)} - ${formatTime(today.close_time)}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-xl p-4 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-400">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-warm-brown">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-4 rounded-full border-teal/30 text-teal">
              Thực đơn nổi bật
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-brown mb-4 tracking-tight">
              Món được yêu thích
            </h2>
            <p className="text-muted-foreground">
              Những món ăn đặc sắc được thực khách đánh giá cao tại Tiệm Người Quảng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {featuredItems.length > 0
              ? featuredItems.map((item) => <MenuCard key={item.id} item={item} />)
              : MENU_CARD_SKELETONS}
          </div>

          {featuredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có món ăn nổi bật.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-warm-brown/20">
                Xem toàn bộ thực đơn
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 lg:py-24 bg-white border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                {business?.cover_image_url ? (
                  <Image
                    src={business.cover_image_url}
                    alt="Về chúng tôi"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-teal via-teal to-warm-brown" />
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden sm:block">
                {business?.about_image_url ? (
                  <Image
                    src={business.about_image_url}
                    alt="Về chúng tôi - chi tiết"
                    fill
                    className="object-cover bg-cream"
                  />
                ) : business?.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt="Logo"
                    fill
                    className="object-cover bg-cream"
                  />
                ) : (
                  <div className="absolute inset-0 bg-cream flex items-center justify-center">
                    <div className="font-display text-5xl text-teal font-bold">
                      TQ
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <Badge variant="outline" className="rounded-full border-teal/30 text-teal">
                Về chúng tôi
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-brown tracking-tight text-balance">
                Kể về câu chuyện
                <br />
                <span className="text-teal italic">hương vị Quảng</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Được thành lập từ niềm đam mê ẩm thực miền Trung, Tiệm Người Quảng mang đến những
                  món ăn đậm chất Quảng Nam với công thức được truyền qua nhiều thế hệ.
                </p>
                <p>
                  Thực đơn của chúng tôi tập trung vào 4 món đặc sản truyền thống: Mì Quảng với
                  tô vàng óng nước dùng đậm đà xương heo, Cao lầu sợi vàng dai mềm vị ngọt đường
                  bì, Bánh canh Giã trong nước dùng thơm lừng mắm tôm, và Bún mọc Quảng với viên
                  mọc heo quết tay giòn ngọt tự làm.
                </p>
                <p>
                  Chúng tôi tin rằng: ẩm thực không chỉ là no bụng, mà là những kỷ niệm, là kết
                  nối, là hương vị quê nhà không thể nào quên.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                      <b.icon className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-warm-brown text-sm">{b.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <Badge variant="outline" className="mb-4 rounded-full border-teal/30 text-teal">
                Giờ mở cửa
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-brown mb-8 tracking-tight">
                Ghé thăm chúng tôi
              </h2>

              <div className="bg-white rounded-2xl border border-border/60 shadow-sm divide-y divide-border/50 overflow-hidden">
                {hours.slice(1).concat(hours[0]).map((h) => {
                  const isToday = h.day_of_week === currentDay;
                  return (
                    <div
                      key={h.day_of_week}
                      className={cn(
                        "flex justify-between items-center px-5 py-3.5 transition-colors",
                        isToday ? "bg-teal/5" : ""
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          isToday
                            ? "text-teal font-semibold"
                            : "text-warm-brown/80"
                        )}
                      >
                        {isToday && <Clock className="h-4 w-4" />}
                        {DAY_OF_WEEK_NAMES[h.day_of_week]}
                        {isToday && (
                          <Badge variant="default" className="text-[10px] px-2 py-0 h-4">
                            Hôm nay
                          </Badge>
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isToday ? "text-teal" : "text-warm-brown/70",
                          !h.is_open && "text-muted-foreground"
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
            </div>

            <div id="location" className="space-y-6">
              <Badge variant="outline" className="rounded-full border-teal/30 text-teal">
                Địa chỉ
              </Badge>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-warm-brown tracking-tight">
                Tìm chúng tôi ở đâu?
              </h3>

              <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-5">
                {business?.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-warm-brown">Địa chỉ</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {[business.address, business.city, business.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {business?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-warm-brown">Điện thoại</h4>
                      <a
                        href={`tel:${business.phone}`}
                        className="text-sm text-muted-foreground mt-1 hover:text-teal transition-colors"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {(business?.latitude && business?.longitude) ||
                settings?.google_maps_url ? (
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {settings?.google_maps_url && (
                      <a href={settings.google_maps_url} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full sm:w-auto rounded-full">
                          <Navigation className="mr-2 h-4 w-4" />
                          Chỉ đường
                        </Button>
                      </a>
                    )}
                    <Link href="/location">
                      <Button variant="outline" className="w-full sm:w-auto rounded-full border-warm-brown/20">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-warm-brown via-[#4A3524] to-teal p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-soft-teal rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto">
              <Badge className="bg-white/10 text-white/90 backdrop-blur-sm mb-6 text-xs">
                Đặt chỗ ngay
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight tracking-tight text-balance">
                Đến và thưởng thức một tô{" "}
                <span className="italic text-soft-teal">Mì Quảng</span> đúng vị
              </h2>
              <p className="text-white/75 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Không gian ấm cúng, phục vụ tận tâm, hương vị đậm đà - hãy để Tiệm Người Quảng
                làm no bụng và ấm lòng bạn.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/menu">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-white text-warm-brown hover:bg-white/90 w-full sm:w-auto shadow-lg shadow-white/10"
                  >
                    Xem menu
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-teal hover:bg-teal/90 text-white w-full sm:w-auto shadow-lg shadow-teal/30 border border-teal-light/20"
                  >
                    Đặt bàn
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
