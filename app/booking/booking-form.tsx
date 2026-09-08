"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormStatus } from "react-dom";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Phone,
} from "lucide-react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { submitBooking } from "./actions";

const bookingFormSchema = z.object({
  customer_name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  booking_date: z.string().min(1, "Vui lòng chọn ngày"),
  booking_time: z.string().min(1, "Vui lòng chọn giờ"),
  guests: z.number().min(1, "Số khách phải lớn hơn 0"),
  note: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const h = 9 + Math.floor(i * 0.5);
  const m = i % 2 === 0 ? "00" : "30";
  if (h > 22) return null;
  return `${String(h).padStart(2, "0")}:${m}`;
}).filter(Boolean) as string[];

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full rounded-full"
      disabled={pending || disabled}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang gửi...
        </>
      ) : (
        "Xác nhận đặt bàn"
      )}
    </Button>
  );
}

export default function BookingForm() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      booking_date: today,
      booking_time: "18:00",
      guests: 2,
      note: "",
    },
  });

  const watchDate = watch("booking_date");
  const watchTime = watch("booking_time");
  const watchGuests = watch("guests");

  async function onSubmit() {
    setErrorMsg(null);
    const formData = new FormData();
    formData.set("customer_name", watch("customer_name") || "");
    formData.set("phone", watch("phone") || "");
    formData.set("email", watch("email") || "");
    formData.set("booking_date", watch("booking_date") || today);
    formData.set("booking_time", watch("booking_time") || "18:00");
    formData.set("guests", String(watch("guests") || 2));
    formData.set("note", watch("note") || "");

    const res: any = await submitBooking(formData);
    if (res?.ok) {
      setSuccess(true);
      reset();
    } else {
      setErrorMsg(res?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center border-teal/20 shadow-sm">
          <CardContent className="p-8 sm:p-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-display text-3xl font-bold text-warm-brown mb-3">
              Đặt bàn thành công!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Cảm ơn bạn đã đặt bàn tại Tiệm Người Quảng. Chúng tôi sẽ liên hệ
              trong thời gian sớm nhất để xác nhận chỗ ngồi cho bạn.
            </p>

            <div className="bg-cream/60 rounded-2xl p-5 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ngày</span>
                <span className="font-semibold text-warm-brown">
                  {new Date(watchDate || today).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Giờ</span>
                <span className="font-semibold text-warm-brown">
                  {watchTime || "18:00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Số khách</span>
                <span className="font-semibold text-warm-brown">
                  {watchGuests || 2} người
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto rounded-full border-warm-brown/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Button>
              </Link>
              <a href="tel:0901234567">
                <Button className="w-full sm:w-auto rounded-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Gọi để xác nhận
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="customer_name" className="text-sm font-medium">
            Họ và tên <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customer_name"
            placeholder="Nguyễn Văn A"
            className="h-11 rounded-xl"
            {...register("customer_name")}
          />
          {errors.customer_name && (
            <p className="text-xs text-red-500">{errors.customer_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="0901 234 567"
            inputMode="tel"
            className="h-11 rounded-xl"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-muted-foreground">(tùy chọn)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <Card className="border-teal/10 bg-gradient-to-br from-teal/[0.03] to-transparent">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Badge className="bg-teal text-xs">Thời gian</Badge>
            <span className="text-sm text-muted-foreground">
              Kiểm tra kỹ thông tin trước khi xác nhận
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="booking_date" className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal" />
                Ngày <span className="text-red-500">*</span>
              </Label>
              <Input
                id="booking_date"
                type="date"
                min={today}
                className="h-11 rounded-xl"
                {...register("booking_date")}
                onChange={(e) => {
                  setValue("booking_date", e.target.value, { shouldValidate: true });
                }}
              />
              {errors.booking_date && (
                <p className="text-xs text-red-500">{errors.booking_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal" />
                Giờ <span className="text-red-500">*</span>
              </Label>
              <Select
                defaultValue="18:00"
                onValueChange={(v) =>
                  setValue("booking_time", v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("booking_time")} value={watchTime || "18:00"} />
              {errors.booking_time && (
                <p className="text-xs text-red-500">{errors.booking_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-4 w-4 text-teal" />
                Số khách <span className="text-red-500">*</span>
              </Label>
              <Select
                defaultValue="2"
                onValueChange={(v) =>
                  setValue("guests", Number(v), { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Chọn số khách" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} người
                    </SelectItem>
                  ))}
                  <SelectItem value="21">20+ người</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("guests")} value={watchGuests || 2} />
              {errors.guests && (
                <p className="text-xs text-red-500">{errors.guests.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="note" className="text-sm font-medium">
          Ghi chú <span className="text-muted-foreground">(tùy chọn)</span>
        </Label>
        <Textarea
          id="note"
          rows={4}
          placeholder="Yêu cầu đặc biệt (góc cửa sổ, dịp tiệc, dị ứng thực phẩm...)"
          className="rounded-xl resize-none"
          {...register("note")}
        />
      </div>

      <div className="pt-4">
        <SubmitButton disabled={isSubmitting} />
        <p className="text-xs text-center text-muted-foreground mt-4">
          Bằng việc đặt bàn, bạn đồng ý với các điều khoản của Tiệm Người Quảng.
        </p>
      </div>
    </form>
  );
}
