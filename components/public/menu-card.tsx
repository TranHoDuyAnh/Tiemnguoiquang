import Image from "next/image";
import {
  Star,
  UtensilsCrossed,
  Leaf,
  HeartHandshake,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn, formatPriceVND } from "@/lib/utils";
import type { MenuItemWithCategory } from "@/lib/types";

interface MenuCardProps {
  item: MenuItemWithCategory;
  loading?: false;
}

interface MenuCardSkeletonProps {
  loading: true;
  item?: MenuItemWithCategory;
}

type Props = MenuCardProps | MenuCardSkeletonProps;

export function MenuCard(props: Props) {
  if (props.loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-2">
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>
    );
  }

  const { item } = props;

  return (
    <article
      className={cn(
        "group rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden transition-all duration-200",
        item.is_available
          ? "hover:shadow-md hover:-translate-y-0.5"
          : "opacity-70"
      )}
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-soft-teal/20 to-teal/10">
            <UtensilsCrossed className="h-10 w-10 text-teal/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {!item.is_available && (
            <Badge variant="destructive" className="text-xs">
              Hết món
            </Badge>
          )}
          {item.is_featured && item.is_available && (
            <Badge className="text-xs bg-teal shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Được yêu thích
            </Badge>
          )}
          {item.category && (
            <Badge variant="secondary" className="text-xs">
              {item.category.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-lg font-semibold text-warm-brown leading-tight">
            {item.name}
          </h3>
          <span className="text-teal font-semibold whitespace-nowrap text-sm sm:text-base shrink-0">
            {formatPriceVND(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

export const MENU_CARD_SKELETONS = Array.from({ length: 6 }, (_, i) => (
  <MenuCard key={i} loading />
));

const BENEFITS = [
  {
    icon: Leaf,
    title: "Nguyên liệu tươi",
    description: "Chọn lọc hàng ngày từ chợ địa phương",
  },
  {
    icon: Flame,
    title: "Hương vị miền Trung",
    description: "Công thức truyền thống qua nhiều thế hệ",
  },
  {
    icon: UtensilsCrossed,
    title: "Nấu mỗi ngày",
    description: "Nấu nướng tươi mới, tối ưu hương vị",
  },
  {
    icon: HeartHandshake,
    title: "Không gian thân thiện",
    description: "Mộc mạc, ấm cúng, gần gũi",
  },
];

export { BENEFITS };
