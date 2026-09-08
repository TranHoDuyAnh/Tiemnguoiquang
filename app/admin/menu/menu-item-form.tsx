"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/admin/image-upload";
import { slugify, formatPriceVND } from "@/lib/utils";
import type { MenuCategory, MenuItemWithCategory } from "@/lib/types";

const menuItemSchema = z.object({
  name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug ít nhất 2 ký tự"),
  category_id: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  sort_order: z.coerce.number().int().default(0),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  image_url: z.string().optional().or(z.literal("")).nullable(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface Props {
  businessId: string;
  categories: MenuCategory[];
  editingItem?: MenuItemWithCategory;
}

export default function MenuItemForm({ businessId, categories, editingItem }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(
    editingItem?.image_url || null
  );

  const isEditing = !!editingItem;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: editingItem?.name || "",
      slug: editingItem?.slug || "",
      category_id: editingItem?.category_id || "",
      description: editingItem?.description || "",
      price: editingItem?.price || 0,
      sort_order: editingItem?.sort_order || 0,
      is_available: editingItem?.is_available ?? true,
      is_featured: editingItem?.is_featured ?? false,
      image_url: editingItem?.image_url || "",
    },
  });

  const watchName = watch("name");
  const watchPrice = watch("price");

  async function onSubmit(values: MenuItemFormValues) {
    setSaving(true);
    try {
      const supabase = createClient();
      const data = {
        name: values.name,
        slug: values.slug || slugify(values.name),
        category_id: values.category_id || null,
        description: values.description || null,
        price: Number(values.price) || 0,
        sort_order: Number(values.sort_order) || 0,
        is_available: values.is_available,
        is_featured: values.is_featured,
        image_url: imageUrl || null,
        business_id: businessId,
      };

      let res;
      if (isEditing) {
        res = await supabase
          .from("menu_items")
          .update(data)
          .eq("id", editingItem.id)
          .select("id")
          .single();
      } else {
        res = await supabase
          .from("menu_items")
          .insert(data)
          .select("id")
          .single();
      }

      if (res.error) throw res.error;

      toast.success(isEditing ? "Cập nhật thành công!" : "Tạo món thành công!");
      router.push("/admin/menu");
      router.refresh();
    } catch (err: any) {
      const msg = err?.message?.includes("duplicate")
        ? "Slug đã tồn tại, vui lòng đổi tên hoặc slug khác"
        : err?.message || "Không thể lưu. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditing ? "Cập nhật thông tin món ăn" : "Tạo món mới cho thực đơn"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Tên món <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Mì Quảng trộn"
                    className="h-11"
                    {...register("name")}
                    onBlur={(e) => {
                      if (!editingItem && !watch("slug")) {
                        setValue("slug", slugify(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="mi-quang-tron"
                    className="h-11"
                    {...register("slug")}
                  />
                  {errors.slug && (
                    <p className="text-xs text-red-500">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Danh mục</Label>
                  <Select
                    defaultValue={editingItem?.category_id || ""}
                    onValueChange={(v) =>
                      setValue("category_id", v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không có</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Giới thiệu ngắn về món..."
                  className="resize-none"
                  {...register("description")}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (VND) <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="45000"
                    className="h-11"
                    {...register("price")}
                  />
                  {watchPrice > 0 && (
                    <div className="text-sm font-semibold text-teal">
                      {formatPriceVND(Number(watchPrice) || 0)}
                    </div>
                  )}
                  {errors.price && (
                    <p className="text-xs text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Thứ tự hiển thị</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="h-11"
                    {...register("sort_order")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <h3 className="font-semibold text-gray-900">Trạng thái</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Đang bán
                    </div>
                    <div className="text-xs text-gray-500">
                      Hiển thị món này trên thực đơn
                    </div>
                  </div>
                  <Switch
                    checked={watch("is_available")}
                    onCheckedChange={(v) => setValue("is_available", v)}
                  />
                  <input type="hidden" {...register("is_available")} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Món nổi bật
                    </div>
                    <div className="text-xs text-gray-500">
                      Hiển thị ở trang chủ
                    </div>
                  </div>
                  <Switch
                    checked={watch("is_featured")}
                    onCheckedChange={(v) => setValue("is_featured", v)}
                  />
                  <input type="hidden" {...register("is_featured")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Hình ảnh món ăn</h3>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                businessId={businessId}
                folder="menu"
                label="Tải ảnh món ăn"
              />
              <p className="text-xs text-gray-400 leading-relaxed">
                Nên dùng ảnh ngang tỉ lệ 16:9, chất lượng cao.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-teal/[0.03] to-transparent">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Lưu ý</h3>
              <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
                <li>• Đặt slug ngắn gọn, dễ đọc (không dấu tiếng Việt).</li>
                <li>• Ảnh càng đẹp, món càng dễ bán.</li>
                <li>• Thứ tự nhỏ hơn sẽ hiển thị trước.</li>
                <li>• Chỉ đánh dấu nổi bật với các món bán chạy.</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href="/admin/menu" className="flex-1">
              <Button variant="outline" className="w-full rounded-full">
                Hủy bỏ
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Lưu thay đổi" : "Tạo món"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
