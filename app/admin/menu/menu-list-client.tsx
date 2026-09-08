"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Star,
  UtensilsCrossed,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPriceVND, cn } from "@/lib/utils";
import type { MenuItemWithCategory, MenuCategory } from "@/lib/types";

interface Props {
  items: MenuItemWithCategory[];
  categories: MenuCategory[];
  businessId: string;
}

export default function MenuListClient({ items, categories, businessId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<MenuItemWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !item.name.toLowerCase().includes(s) &&
          !item.description?.toLowerCase().includes(s)
        )
          return false;
      }
      if (categoryFilter !== "all" && item.category_id !== categoryFilter)
        return false;
      if (statusFilter === "available" && !item.is_available) return false;
      if (statusFilter === "unavailable" && item.is_available) return false;
      if (statusFilter === "featured" && !item.is_featured) return false;
      return true;
    });
  }, [items, search, categoryFilter, statusFilter]);

  async function toggleAvailable(item: MenuItemWithCategory) {
    setTogglingId(item.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !item.is_available })
        .eq("id", item.id);
      if (error) throw error;
      toast.success(
        item.is_available ? "Đã ẩn món" : "Đã hiển thị món"
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setTogglingId(null);
    }
  }

  async function toggleFeatured(item: MenuItemWithCategory) {
    setTogglingId(item.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_items")
        .update({ is_featured: !item.is_featured })
        .eq("id", item.id);
      if (error) throw error;
      toast.success(
        item.is_featured ? "Đã bỏ khỏi nổi bật" : "Đánh dấu nổi bật"
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(item: MenuItemWithCategory) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      toast.success("Đã xóa món ăn");
      setDeleteDialog(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa món");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Quản lý thực đơn
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} món · {categories.length} danh mục
          </p>
        </div>
        <Link href="/admin/menu/new">
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Thêm món mới
          </Button>
        </Link>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm món ăn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 rounded-lg"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="available">Đang bán</SelectItem>
                <SelectItem value="unavailable">Hết món</SelectItem>
                <SelectItem value="featured">Nổi bật</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Chưa có món ăn nào
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              Bắt đầu tạo menu cho nhà hàng của bạn.
            </p>
            <Link href="/admin/menu/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm món đầu tiên
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14">Ảnh</TableHead>
                    <TableHead>Tên món</TableHead>
                    <TableHead className="w-32">Giá</TableHead>
                    <TableHead className="w-36">Danh mục</TableHead>
                    <TableHead className="w-24 text-center">Trạng thái</TableHead>
                    <TableHead className="w-24 text-center">Nổi bật</TableHead>
                    <TableHead className="w-40 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-gray-500"
                      >
                        Không tìm thấy món nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <UtensilsCrossed className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 text-sm leading-tight">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {item.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-teal text-sm whitespace-nowrap">
                          {formatPriceVND(item.price)}
                        </TableCell>
                        <TableCell>
                          {item.category ? (
                            <Badge variant="secondary" className="font-normal text-xs">
                              {item.category.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Chưa phân loại
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => toggleAvailable(item)}
                            disabled={togglingId === item.id}
                            className="inline-flex"
                            aria-label={item.is_available ? "Hết món" : "Đang bán"}
                          >
                            {item.is_available ? (
                              <ToggleRight className="h-6 w-6 text-green-600 shrink-0" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-gray-300 shrink-0" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => toggleFeatured(item)}
                            disabled={togglingId === item.id}
                            className="inline-flex"
                            aria-label={item.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                          >
                            <Star
                              className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                item.is_featured
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200 hover:text-amber-300"
                              )}
                            />
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-0.5">
                            <Link
                              href={`/admin/menu/${item.id}/edit`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-teal hover:bg-teal/5 transition-colors"
                              aria-label="Sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteDialog(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-3">
            {filtered.length === 0 ? (
              <Card className="border-gray-100">
                <CardContent className="py-12 text-center text-gray-500">
                  Không tìm thấy món nào phù hợp.
                </CardContent>
              </Card>
            ) : (
              filtered.map((item) => (
                <Card key={item.id} className="border-gray-100 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <UtensilsCrossed className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
                          {item.name}
                        </div>
                        <div className="font-semibold text-teal text-sm whitespace-nowrap shrink-0">
                          {formatPriceVND(item.price)}
                        </div>
                      </div>
                      {item.category && (
                        <Badge
                          variant="secondary"
                          className="font-normal text-[10px] mt-1"
                        >
                          {item.category.name}
                        </Badge>
                      )}
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailable(item)}
                        disabled={togglingId === item.id}
                        className="inline-flex items-center gap-1.5 text-xs"
                      >
                        {item.is_available ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-600" />
                            <span className="text-green-700">Đang bán</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-300" />
                            <span className="text-gray-500">Hết món</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleFeatured(item)}
                        disabled={togglingId === item.id}
                        aria-label="Nổi bật"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            item.is_featured
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          )}
                        />
                      </button>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/menu/${item.id}/edit`}
                        className="inline-flex h-8 px-2.5 items-center gap-1 rounded-md text-xs text-gray-600 hover:text-teal hover:bg-teal/5"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Sửa
                      </Link>
                      <button
                        onClick={() => setDeleteDialog(item)}
                        className="inline-flex h-8 px-2.5 items-center gap-1 rounded-md text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <Dialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa món ăn?</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa <strong>{deleteDialog?.name}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              disabled={deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa món ăn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
