"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  FolderKanban,
  ToggleLeft,
  ToggleRight,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn, slugify } from "@/lib/utils";
import type { MenuCategory } from "@/lib/types";

interface Props {
  categories: MenuCategory[];
  businessId: string;
}

type EditForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export default function CategoriesClient({ categories, businessId }: Props) {
  const router = useRouter();
  const [list, setList] = useState(categories);
  const [openNew, setOpenNew] = useState(false);
  const [editDialog, setEditDialog] = useState<MenuCategory | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<MenuCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
  });

  const [editForm, setEditForm] = useState<EditForm>({
    id: "",
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
  });

  function openEdit(c: MenuCategory) {
    setEditDialog(c);
    setEditForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      sort_order: c.sort_order,
    });
  }

  async function createCategory() {
    if (!newForm.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const slug = newForm.slug || slugify(newForm.name);
      const { error } = await supabase.from("menu_categories").insert({
        business_id: businessId,
        name: newForm.name,
        slug,
        description: newForm.description || null,
        sort_order: newForm.sort_order,
        is_active: true,
      });
      if (error) throw error;
      toast.success("Tạo danh mục thành công!");
      setNewForm({ name: "", slug: "", description: "", sort_order: 0 });
      setOpenNew(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message?.includes("duplicate")
        ? "Slug hoặc tên danh mục đã tồn tại"
        : err?.message || "Không thể tạo danh mục");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editForm.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const slug = editForm.slug || slugify(editForm.name);
      const { error } = await supabase
        .from("menu_categories")
        .update({
          name: editForm.name,
          slug,
          description: editForm.description || null,
          sort_order: editForm.sort_order,
        })
        .eq("id", editForm.id);
      if (error) throw error;
      toast.success("Cập nhật thành công!");
      setEditDialog(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: MenuCategory) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_categories")
        .delete()
        .eq("id", c.id);
      if (error) throw error;
      toast.success("Đã xóa danh mục");
      setList((prev) => prev.filter((i) => i.id !== c.id));
      setDeleteDialog(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleActive(c: MenuCategory) {
    setTogglingId(c.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_categories")
        .update({ is_active: !c.is_active })
        .eq("id", c.id);
      if (error) throw error;
      toast.success(c.is_active ? "Đã ẩn" : "Đã bật");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Quản lý danh mục
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {list.length} danh mục món ăn
          </p>
        </div>
        <Button onClick={() => setOpenNew(true)} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {list.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Chưa có danh mục nào
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              Tạo các danh mục như Mì Quảng, Cơm, Đồ uống...
            </p>
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo danh mục đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead className="w-44">Slug</TableHead>
                    <TableHead className="w-20 text-center">Thứ tự</TableHead>
                    <TableHead className="w-24 text-center">Trạng thái</TableHead>
                    <TableHead className="w-36 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-gray-300" />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 text-sm">
                          {c.name}
                        </div>
                        {c.description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {c.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          /{c.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-600">
                        {c.sort_order}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleActive(c)}
                          disabled={togglingId === c.id}
                        >
                          {c.is_active ? (
                            <ToggleRight className="h-6 w-6 text-green-600 mx-auto" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-gray-300 mx-auto" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-0.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-teal hover:bg-teal/5"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog(c)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-3">
            {list.map((c) => (
              <Card key={c.id} className="border-gray-100">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        /{c.slug} · Thứ tự {c.sort_order}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={togglingId === c.id}
                      className="shrink-0"
                    >
                      {c.is_active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                  </div>
                  {c.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-end gap-1 p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(c)}
                    className="h-8 px-3 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialog(c)}
                    className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Xóa
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Tạo một danh mục mới cho món ăn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tên danh mục *</Label>
              <Input
                placeholder="Mì Quảng"
                value={newForm.name}
                onChange={(e) => {
                  setNewForm({
                    ...newForm,
                    name: e.target.value,
                    slug: newForm.slug || slugify(e.target.value),
                  });
                }}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                placeholder="mi-quang"
                value={newForm.slug}
                onChange={(e) =>
                  setNewForm({ ...newForm, slug: slugify(e.target.value) })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={3}
                placeholder="Danh mục các món Mì Quảng đặc trưng..."
                value={newForm.description}
                onChange={(e) =>
                  setNewForm({ ...newForm, description: e.target.value })
                }
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input
                type="number"
                min={0}
                value={newForm.sort_order}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    sort_order: Number(e.target.value) || 0,
                  })
                }
                className="h-11 w-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>
              Hủy
            </Button>
            <Button onClick={createCategory} disabled={saving}>
              {saving ? "Đang lưu..." : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDialog} onOpenChange={(o) => !o && setEditDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>Cập nhật thông tin danh mục.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tên danh mục *</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) =>
                  setEditForm({ ...editForm, slug: slugify(e.target.value) })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input
                type="number"
                min={0}
                value={editForm.sort_order}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    sort_order: Number(e.target.value) || 0,
                  })
                }
                className="h-11 w-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>
              Hủy
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteDialog}
        onOpenChange={(o) => !o && setDeleteDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa danh mục?</DialogTitle>
            <DialogDescription>
              Xóa <strong>{deleteDialog?.name}</strong>? Các món trong danh mục
              này sẽ thành &ldquo;chưa phân loại&rdquo;. Không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={deleting}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              disabled={deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
