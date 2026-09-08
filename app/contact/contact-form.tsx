"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send,
  CheckCircle2,
  Mail,
  User,
  MessageSquare,
  ArrowLeft,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { submitContact } from "./actions";

const contactSchema = z.object({
  name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().min(2, "Tiêu đề ít nhất 2 ký tự"),
  message: z.string().min(10, "Tin nhắn quá ngắn (ít nhất 10 ký tự)"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("email", values.email || "");
      formData.set("phone", values.phone || "");
      formData.set("subject", values.subject);
      formData.set("message", values.message);

      const res: any = await submitContact(formData);
      if (res?.ok) {
        setSuccess(true);
        reset();
      } else {
        setErrorMsg(res?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setErrorMsg("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="text-center border-green-200 shadow-sm">
        <CardContent className="p-8 sm:p-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-warm-brown mb-3">
            Gửi tin nhắn thành công!
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Cảm ơn bạn đã liên hệ. Chúng tôi sẽ đọc và phản hồi trong thời gian
            sớm nhất có thể.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto rounded-full border-warm-brown/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </Link>
            <Link href="/menu">
              <Button className="w-full sm:w-auto rounded-full">
                Xem thực đơn
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
            <User className="h-4 w-4 text-teal" />
            Họ và tên <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Nguyễn Văn A"
            className="h-11 rounded-xl"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-teal" />
            Tiêu đề <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            placeholder="Liên hệ hợp tác / Phản hồi"
            className="h-11 rounded-xl"
            {...register("subject")}
          />
          {errors.subject && (
            <p className="text-xs text-red-500">{errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-teal" />
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

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-teal" />
            Điện thoại <span className="text-muted-foreground">(tùy chọn)</span>
          </Label>
          <Input
            id="phone"
            inputMode="tel"
            placeholder="0901 234 567"
            className="h-11 rounded-xl"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-teal" />
          Nội dung tin nhắn <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          rows={7}
          placeholder="Hãy chia sẻ với chúng tôi những gì bạn muốn biết..."
          className="rounded-xl resize-none"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px] rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
              </svg>
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Gửi tin nhắn
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
