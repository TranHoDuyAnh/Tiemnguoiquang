"use client";

import { useState, useMemo } from "react";
import { MenuCard } from "@/components/public/menu-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuItemWithCategory } from "@/lib/types";

interface MenuClientProps {
  categories: MenuCategory[];
  items: MenuItemWithCategory[];
  groupedItems: Record<string, MenuItemWithCategory[]>;
  uncategorizedItems: MenuItemWithCategory[];
}

export default function MenuClient({
  categories,
  items,
  groupedItems,
  uncategorizedItems,
}: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems = useMemo(() => {
    if (items.length === 0) return [];
    if (activeCategory === "all") return items;
    if (activeCategory === "uncategorized") return uncategorizedItems;
    return groupedItems[activeCategory] || [];
  }, [activeCategory, items, groupedItems, uncategorizedItems]);

  if (items.length === 0) return null;

  const totalAvailable = items.filter((i) => i.is_available).length;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-sm text-muted-foreground">
          {totalAvailable} món đang phục vụ · {categories.length} danh mục
        </div>

        <div className="mb-10 -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-4 h-9 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeCategory === "all"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-white border border-border/60 text-warm-brown/80 hover:border-teal/30 hover:text-teal"
              )}
            >
              Tất cả ({items.length})
            </button>
            {categories.map((cat) => {
              const count = groupedItems[cat.id]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 h-9 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    activeCategory === cat.id
                      ? "bg-teal text-white shadow-sm"
                      : "bg-white border border-border/60 text-warm-brown/80 hover:border-teal/30 hover:text-teal"
                  )}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
            {uncategorizedItems.length > 0 && (
              <button
                onClick={() => setActiveCategory("uncategorized")}
                className={cn(
                  "px-4 h-9 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  activeCategory === "uncategorized"
                    ? "bg-teal text-white shadow-sm"
                    : "bg-white border border-border/60 text-warm-brown/80 hover:border-teal/30 hover:text-teal"
                )}
              >
                Khác ({uncategorizedItems.length})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <MenuCard key={item.id} item={item} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">
                Không có món ăn nào trong danh mục này.
              </p>
              <Button
                variant="link"
                className="mt-2 text-teal"
                onClick={() => setActiveCategory("all")}
              >
                Xem tất cả món
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
