"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageSquareText,
  Mail,
  Phone,
  User,
  MailOpen,
  Reply,
  Inbox,
  X,
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
import { Separator } from "@/components/ui/separator";
import { cn, formatDateTime } from "@/lib/utils";
import type { ContactMessage, MessageStatus } from "@/lib/types";

interface Props {
  messages: ContactMessage[];
  businessId: string;
  unreadCount: number;
}

const STATUS_COLORS: Record<MessageStatus, string> = {
  unread: "bg-teal/10 text-teal border-teal/20",
  read: "bg-blue-100 text-blue-800 border-blue-200",
  replied: "bg-green-100 text-green-800 border-green-200",
};

const STATUS_LABELS: Record<MessageStatus, string> = {
  unread: "Chưa đọc",
  read: "Đã đọc",
  replied: "Đã phản hồi",
};

export default function MessagesClient({
  messages,
  businessId,
  unreadCount,
}: Props) {
  const router = useRouter();
  const [list, setList] = useState(messages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return list.filter((m) => {
      if (search) {
        const s = search.toLowerCase().trim();
        if (
          !m.name.toLowerCase().includes(s) &&
          !(m.email || "").toLowerCase().includes(s) &&
          !(m.phone || "").toLowerCase().includes(s) &&
          !(m.subject || "").toLowerCase().includes(s) &&
          !m.message.toLowerCase().includes(s)
        )
          return false;
      }
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return true;
    });
  }, [list, search, statusFilter]);

  async function openDetail(m: ContactMessage) {
    setDetail(m);
    if (m.status === "unread") {
      setUpdatingId(m.id);
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("contact_messages")
          .update({ status: "read" })
          .eq("id", m.id);
        if (!error) {
          setList((prev) =>
            prev.map((x) => (x.id === m.id ? { ...x, status: "read" as MessageStatus } : x))
          );
        }
      } catch {
        // no-op
      } finally {
        setUpdatingId(null);
      }
    }
  }

  async function markReplied(m: ContactMessage) {
    setUpdatingId(m.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "replied" })
        .eq("id", m.id);
      if (error) throw error;
      setList((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: "replied" as MessageStatus } : x))
      );
      setDetail((prev) =>
        prev && prev.id === m.id ? { ...prev, status: "replied" as MessageStatus } : prev
      );
      toast.success("Đã đánh dấu đã phản hồi");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setUpdatingId(null);
    }
  }

  async function markRead(m: ContactMessage) {
    setUpdatingId(m.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", m.id);
      if (error) throw error;
      setList((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: "read" as MessageStatus } : x))
      );
      setDetail((prev) =>
        prev && prev.id === m.id ? { ...prev, status: "read" as MessageStatus } : prev
      );
      toast.success("Đã đánh dấu đã đọc");
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Tin nhắn khách hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {list.length} tin nhắn ·{" "}
            <span className="text-teal font-semibold">{unreadCount} chưa đọc</span>
          </p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm tên, email, SĐT, nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 rounded-lg"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="unread">Chưa đọc</SelectItem>
              <SelectItem value="read">Đã đọc</SelectItem>
              <SelectItem value="replied">Đã phản hồi</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Hộp thư trống
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Khi khách hàng liên hệ, tin nhắn sẽ hiển thị ở đây.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="border-gray-100">
              <CardContent className="py-12 text-center text-gray-500 text-sm">
                Không có kết quả phù hợp.
              </CardContent>
            </Card>
          ) : (
            filtered.map((m) => (
              <Card
                key={m.id}
                className={cn(
                  "border-gray-100 shadow-sm transition-shadow cursor-pointer hover:shadow-md",
                  m.status === "unread" && "ring-1 ring-teal/20 bg-teal/[0.02]"
                )}
                onClick={() => openDetail(m)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal/10 to-soft-teal/20 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-teal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "font-semibold text-gray-900",
                                m.status === "unread" && "text-warm-brown"
                              )}
                            >
                              {m.name}
                            </span>
                            <Badge
                              className={cn(
                                "text-[10px] px-1.5 h-4 border font-medium",
                                STATUS_COLORS[m.status]
                              )}
                            >
                              {STATUS_LABELS[m.status]}
                            </Badge>
                            {m.status === "unread" && (
                              <span className="w-2 h-2 rounded-full bg-teal animate-pulse shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                            {m.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {m.email}
                              </span>
                            )}
                            {m.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {m.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {m.subject && (
                        <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                          {m.subject}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed pl-13 ml-13 sm:ml-0 sm:pl-0" style={{ marginLeft: m.name ? 0 : 0, paddingLeft: m.name ? 52 : 0 }}>
                        {m.message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                      {formatDateTime(m.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-xl">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <MessageSquareText className="h-5 w-5 text-teal" />
                      Chi tiết tin nhắn
                    </DialogTitle>
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
              <div className="space-y-4 py-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">
                      Người gửi
                    </Label>
                    <div className="font-semibold text-gray-900 mt-0.5">
                      {detail.name}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {detail.email && (
                        <>
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <a
                            href={`mailto:${detail.email}`}
                            className="text-gray-700 hover:text-teal break-all"
                          >
                            {detail.email}
                          </a>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {detail.phone && (
                        <>
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <a
                            href={`tel:${detail.phone}`}
                            className="text-gray-700 hover:text-teal"
                          >
                            {detail.phone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {detail.subject && (
                  <div className="p-4 rounded-xl border border-gray-100">
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Tiêu đề
                    </div>
                    <div className="font-semibold text-gray-900">
                      {detail.subject}
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-cream to-white border border-gray-100">
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mb-2">
                    Nội dung
                  </div>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-[15px]">
                    {detail.message}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
                {detail.status === "unread" && (
                  <Button
                    variant="outline"
                    onClick={() => markRead(detail)}
                    disabled={updatingId === detail.id}
                    className="w-full sm:w-auto rounded-full"
                  >
                    <MailOpen className="h-4 w-4 mr-2" />
                    Đánh dấu đã đọc
                  </Button>
                )}
                {detail.status !== "replied" && (
                  <Button
                    onClick={() => markReplied(detail)}
                    disabled={updatingId === detail.id}
                    className="w-full sm:w-auto rounded-full"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Đánh dấu đã phản hồi
                  </Button>
                )}
                {detail.email && (
                  <a
                    href={`mailto:${detail.email}${
                      detail.subject ? `?subject=Re: ${encodeURIComponent(detail.subject)}` : ""
                    }`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Trả lời qua email
                    </Button>
                  </a>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
