"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  LogOut,
  User,
  Mail,
  Building2,
  Clock,
  Store,
  Settings2,
  Save,
  ArrowRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  full_name: z.string().min(1, "Tên không được để trống"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [initialName, setInitialName] = useState<string>("");

  useEffect(() => {
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setInitialName(profile.full_name || "");
          reset({ full_name: profile.full_name || "" });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "" },
  });

  const onSaveProfile = (values: ProfileForm) => {
    startTransition(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Chưa đăng nhập");
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: values.full_name })
          .eq("id", user.id);
        if (error) throw error;
        toast.success("Đã cập nhật hồ sơ");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || "Lỗi khi lưu");
      }
    });
  };

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      window.setTimeout(() => {
        window.location.assign("/admin/login");
      }, 100);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đăng xuất");
      setSigningOut(false);
    }
  };

  const initials = (initialName || userEmail || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-warm-brown-900 md:text-3xl">
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-warm-brown-600">
          Quản lý tài khoản và cài đặt hệ thống.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal" />
                Hồ sơ cá nhân
              </CardTitle>
              <CardDescription>
                Thông tin tài khoản quản trị viên.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSaveProfile)}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-warm-brown-200 bg-teal/10 text-teal">
                    <AvatarFallback className="text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-warm-brown-900">{initialName || "Quản trị viên"}</p>
                    <p className="flex items-center gap-1 text-sm text-warm-brown-600">
                      <Mail className="h-3.5 w-3.5" />
                      {userEmail || "—"}
                    </p>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-teal/10 text-teal">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="full_name">Họ và tên</Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t px-6 py-4">
                <Button type="submit" disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-teal" />
                Cài đặt doanh nghiệp
              </CardTitle>
              <CardDescription>
                Các liên kết quản lý nhanh.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/business"
                className="group flex items-center justify-between rounded-xl border border-warm-brown-100 bg-cream p-4 transition hover:border-teal/30 hover:bg-teal/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-brown-900 text-cream">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-warm-brown-900">Thông tin quán</p>
                    <p className="text-xs text-warm-brown-600">Logo, địa chỉ, mạng xã hội</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-warm-brown-400 transition group-hover:translate-x-0.5 group-hover:text-teal" />
              </Link>
              <Link
                href="/admin/hours"
                className="group flex items-center justify-between rounded-xl border border-warm-brown-100 bg-cream p-4 transition hover:border-teal/30 hover:bg-teal/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-brown-900 text-cream">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-warm-brown-900">Giờ mở cửa</p>
                    <p className="text-xs text-warm-brown-600">Thời gian hoạt động 7 ngày</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-warm-brown-400 transition group-hover:translate-x-0.5 group-hover:text-teal" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal" />
                Tóm tắt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-cream p-3">
                <span className="text-warm-brown-600">Trang công khai</span>
                <Link href="/" target="_blank" className="font-medium text-teal hover:underline">
                  Mở →
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-cream p-3">
                <span className="text-warm-brown-600">Đặt bàn</span>
                <Link href="/booking" target="_blank" className="font-medium text-teal hover:underline">
                  Mở →
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-cream p-3">
                <span className="text-warm-brown-600">Thực đơn</span>
                <Link href="/menu" target="_blank" className="font-medium text-teal hover:underline">
                  Mở →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Phiên đăng nhập</CardTitle>
              <CardDescription className="text-warm-brown-600">
                Đăng xuất khỏi tài khoản quản trị.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                disabled={signingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {signingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
