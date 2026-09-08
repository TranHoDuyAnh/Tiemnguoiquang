import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuCard, MENU_CARD_SKELETONS } from "@/components/public/menu-card";
import { PublicLayout } from "@/components/public/layout";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getMenuCategories, getMenuItems } from "@/lib/data/menu";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import MenuClient from "./menu-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Thực đơn | Tiệm Người Quảng",
  description:
    "Thực đơn Mì Quảng và các món ăn đặc sản miền Trung tại Tiệm Người Quảng.",
};

export default async function MenuPage() {
  const business = await getBusinessBySlug(BUSINESS_SLUG);
  const categories = business ? await getMenuCategories(business.id) : [];
  const items = business ? await getMenuItems(business.id, { onlyAvailable: false }) : [];

  const groupedItems = categories.reduce<Record<string, typeof items>>((acc, cat) => {
    acc[cat.id] = items.filter((i) => i.category_id === cat.id);
    return acc;
  }, {});

  const uncategorizedItems = items.filter((i) => !i.category_id);

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
              Thực đơn
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-brown mb-4 tracking-tight">
              Khám phá thực đơn
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              Các món ăn đậm đà hương vị miền Trung, từ món nước đến cơm, từ món
              lặt vặt đến đồ uống - tất cả đều được chế biến tươi mới mỗi ngày.
            </p>
          </div>
        </div>
      </section>

      <MenuClient
        categories={categories}
        items={items}
        groupedItems={groupedItems}
        uncategorizedItems={uncategorizedItems}
      />

      {(items.length === 0) && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="h-10 w-10 text-teal" />
              </div>
              <h3 className="font-display text-2xl font-bold text-warm-brown mb-3">
                Chưa có món ăn nào
              </h3>
              <p className="text-muted-foreground mb-6">
                Thực đơn đang được cập nhật. Quay lại sau nhé!
              </p>
              <Link href="/">
                <Button variant="outline" className="rounded-full">
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="container mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MENU_CARD_SKELETONS}
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
