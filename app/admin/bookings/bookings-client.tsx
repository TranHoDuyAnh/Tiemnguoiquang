"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CalendarClock,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Filter,
  CheckCircle2,
  XCircle,
  CircleCheckBig,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
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
import { cn, formatDate, formatDateTime, formatTime } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/types";

interface Props {
  bookings: Booking[];
  businessId: string;
  stats: { pending: number; confirmed: number };
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const STATUS_OPTIONS: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

export default function BookingsClient({ bookings, businessId, stats }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [detail, setDetail] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (search) {
        const s = search.toLowerCase().trim();
        if (
          !b.customer_name.toLowerCase().includes(s) &&
          !b.phone.toLowerCase().includes(s)
        )
          return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (dateFilter && b.booking_date !== dateFilter) return false;
      return true;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Đã ${STATUS_LABELS[status].toLowerCase()}`);
      setDetail((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Quản lý đặt bàn
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {bookings.length} lượt đặt ·{" "}
            <span className="text-amber-600 font-medium">{stats.pending} chờ xác nhận</span> ·{" "}
            <span className="text-green-600 font-medium">{stats.confirmed} đã xác nhận</span>
          </p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 rounded-lg"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-lg">
              <Filter className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {bookings.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Chưa có đặt bàn nào
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Khi khách hàng đặt bàn online, thông tin sẽ hiển thị ở đây.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="w-28">Ngày</TableHead>
                    <TableHead className="w-20">Giờ</TableHead>
                    <TableHead className="w-20 text-center">Khách</TableHead>
                    <TableHead className="w-32">Trạng thái</TableHead>
                    <TableHead className="w-44 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-gray-500"
                      >
                        Không có kết quả phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900 text-sm">
                            {b.customer_name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {b.phone}
                            </span>
                            {b.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {b.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                          {formatDate(b.booking_date)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                          {formatTime(b.booking_time)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-medium">
                            <Users className="h-3 w-3 mr-1" />
                            {b.guests}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs font-medium border",
                              STATUS_COLORS[b.status]
                            )}
                          >
                            {STATUS_LABELS[b.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs rounded-lg"
                              onClick={() => setDetail(b)}
                            >
                              Chi tiết
                            </Button>
                            {b.status === "pending" && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs rounded-lg"
                                onClick={() => updateStatus(b.id, "confirmed")}
                                disabled={updating === b.id}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Xác nhận
                              </Button>
                            )}
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
                  Không có kết quả phù hợp.
                </CardContent>
              </Card>
            ) : (
              filtered.map((b) => (
                <Card key={b.id} className="border-gray-100">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">
                          {b.customer_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                          <div className="inline-flex items-center gap-1 mr-3">
                            <Phone className="h-3 w-3" />
                            {b.phone}
                          </div>
                          {b.email && (
                            <div className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {b.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-medium border shrink-0",
                          STATUS_COLORS[b.status]
                        )}
                      >
                        {STATUS_LABELS[b.status]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{formatDate(b.booking_date).split(" ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {formatTime(b.booking_time)}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {b.guests} khách
                      </div>
                    </div>
                    {b.note && (
                      <div className="mt-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-600 line-clamp-2">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {b.note}
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex gap-2 p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs rounded-lg"
                      onClick={() => setDetail(b)}
                    >
                      Xem chi tiết
                    </Button>
                    {b.status === "pending" && (
                      <Button
                        size="sm"
                        className="flex-1 h-9 text-xs rounded-lg"
                        onClick={() => updateStatus(b.id, "confirmed")}
                        disabled={updating === b.id}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Xác nhận
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="text-xl">Chi tiết đặt bàn</DialogTitle>
                    <DialogDescription className="mt-1">
                      {formatDateTime(detail.created_at)}
                    </DialogDescription>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs font-medium border shrink-0",
                      STATUS_COLORS[detail.status]
                    )}
                  >
                    {STATUS_LABELS[detail.status]}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-5 py-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">Khách hàng</div>
                    <div className="font-semibold text-gray-900">
                      {detail.customer_name}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">Số khách</div>
                    <div className="font-semibold text-gray-900">
                      {detail.guests} người
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">Điện thoại</div>
                    <a
                      href={`tel:${detail.phone}`}
                      className="font-semibold text-gray-900 hover:text-teal"
                    >
                      {detail.phone}
                    </a>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-900 break-all">
                      {detail.email || "—"}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">Ngày</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(detail.booking_date)}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-500">Giờ</div>
                    <div className="font-semibold text-gray-900">
                      {formatTime(detail.booking_time)}
                    </div>
                  </div>
                </div>

                {detail.note && (
                  <div className="space-y-1.5 p-4 rounded-xl bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">
                      Ghi chú khách hàng
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {detail.note}
                    </p>
                  </div>
                )}

                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Cập nhật trạng thái
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={detail.status === s ? "default" : "outline"}
                        size="sm"
                        className="h-10 text-xs"
                        onClick={() => updateStatus(detail.id, s)}
                        disabled={updating === detail.id}
                      >
                        {s === "confirmed" && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        {s === "cancelled" && <XCircle className="h-3.5 w-3.5 mr-1" />}
                        {s === "completed" && <CircleCheckBig className="h-3.5 w-3.5 mr-1" />}
                        {s === "pending" && <Circle className="h-3.5 w-3.5 mr-1" />}
                        {STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetail(null)}
                  className="rounded-full"
                >
                  Đóng
                </Button>
                <a
                  href={`tel:${detail.phone}`}
                  className="inline-flex"
                >
                  <Button className="rounded-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Gọi khách
                  </Button>
                </a>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
