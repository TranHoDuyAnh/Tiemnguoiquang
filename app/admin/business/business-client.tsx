"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Save,
  MapPin,
  Mail,
  Phone,
  Globe,
  Loader2,
  Facebook,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/admin/image-upload";
import type { Business, BusinessSettings } from "@/lib/types";

interface Props {
  business: Business;
  settings?: BusinessSettings;
}

export default function BusinessClient({ business, settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: business.name,
    slug: business.slug,
    description: business.description || "",
    phone: business.phone || "",
    email: business.email || "",
    address: business.address || "",
    city: business.city || "",
    country: business.country || "Vietnam",
    latitude: business.latitude?.toString() || "",
    longitude: business.longitude?.toString() || "",
    website_url: business.website_url || "",
    logo_url: business.logo_url || null,
    cover_image_url: business.cover_image_url || null,
    about_image_url: (business as any).about_image_url || null,
  });

  const [settingsForm, setSettingsForm] = useState({
    facebook_url: settings?.facebook_url || "",
    instagram_url: settings?.instagram_url || "",
    tiktok_url: settings?.tiktok_url || "",
    google_maps_url: settings?.google_maps_url || "",
    allow_booking: settings?.allow_booking ?? true,
  });

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Tên quán không được bỏ trống");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const bizPayload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        city: form.city || null,
        country: form.country || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        website_url: form.website_url || null,
        logo_url: form.logo_url || null,
        cover_image_url: form.cover_image_url || null,
        about_image_url: (form as any).about_image_url || null,
      };
      const { error: bizError } = await supabase
        .from("businesses")
        .update(bizPayload)
        .eq("id", business.id);
      if (bizError) throw bizError;

      const settingsPayload = {
        business_id: business.id,
        facebook_url: settingsForm.facebook_url || null,
        instagram_url: settingsForm.instagram_url || null,
        tiktok_url: settingsForm.tiktok_url || null,
        google_maps_url: settingsForm.google_maps_url || null,
        allow_booking: settingsForm.allow_booking,
      };

      if (settings?.id) {
        const { error } = await supabase
          .from("business_settings")
          .update(settingsPayload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_settings")
          .insert(settingsPayload);
        if (error) throw error;
      }

      toast.success("Đã lưu thay đổi!");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message?.includes("duplicate")
        ? "Slug đã tồn tại"
        : err?.message || "Không thể lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-teal shrink-0" />
            Thông tin quán
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cập nhật thông tin hiển thị trên website của bạn.
          </p>
        </div>
        <Button
          onClick={handleSave}
          size="lg"
          className="rounded-full"
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
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="p-5 sm:p-6 pb-3">
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              <CardDescription>
                Tên, mô tả, logo và ảnh bìa của quán.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-3 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Tên quán *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11"
                    placeholder="Tiệm Người Quảng"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-"),
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quốc gia</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="h-11"
                    placeholder="Vietnam"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="resize-none"
                  placeholder="Mô tả ngắn gọn về quán (sẽ xuất hiện trên trang chủ và SEO)"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    Logo
                  </Label>
                  <ImageUpload
                    value={form.logo_url}
                    onChange={(v) => setForm({ ...form, logo_url: v })}
                    businessId={business.id}
                    folder="logos"
                    label="Tải logo lên"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    Ảnh bìa
                  </Label>
                  <ImageUpload
                    value={form.cover_image_url}
                    onChange={(v) => setForm({ ...form, cover_image_url: v })}
                    businessId={business.id}
                    folder="covers"
                    label="Tải ảnh bìa lên"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    Ảnh mục Về chúng tôi
                  </Label>
                  <ImageUpload
                    value={(form as any).about_image_url}
                    onChange={(v) => setForm({ ...(form as any), about_image_url: v })}
                    businessId={business.id}
                    folder="covers"
                    label="Ảnh góc nhỏ Về chúng tôi"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="p-5 sm:p-6 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal" />
                Địa chỉ &amp; Liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-3 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="h-11"
                    placeholder="123 Đường Nguyễn Huệ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thành phố / Tỉnh</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="h-11"
                    placeholder="Đà Nẵng"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    Số điện thoại
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11"
                    inputMode="tel"
                    placeholder="0901 234 567"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-11"
                    placeholder="hello@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    Website
                  </Label>
                  <Input
                    value={form.website_url}
                    onChange={(e) =>
                      setForm({ ...form, website_url: e.target.value })
                    }
                    className="h-11"
                    placeholder="https://yourdomain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Latitude (tùy chọn)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm({ ...form, latitude: e.target.value })
                    }
                    className="h-11"
                    placeholder="16.0544"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude (tùy chọn)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm({ ...form, longitude: e.target.value })
                    }
                    className="h-11"
                    placeholder="108.2022"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg">Mạng xã hội</CardTitle>
              <CardDescription>Liên kết sẽ hiển thị ở footer.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Facebook className="h-3.5 w-3.5 text-blue-600" />
                  Facebook
                </Label>
                <Input
                  value={settingsForm.facebook_url}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      facebook_url: e.target.value,
                    })
                  }
                  className="h-11"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Instagram className="h-3.5 w-3.5 text-pink-600" />
                  Instagram
                </Label>
                <Input
                  value={settingsForm.instagram_url}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      instagram_url: e.target.value,
                    })
                  }
                  className="h-11"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-gray-900">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" />
                  </svg>
                  TikTok
                </Label>
                <Input
                  value={settingsForm.tiktok_url}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      tiktok_url: e.target.value,
                    })
                  }
                  className="h-11"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg">Google Maps</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
              <div className="space-y-2">
                <Label>Google Maps URL</Label>
                <Input
                  value={settingsForm.google_maps_url}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      google_maps_url: e.target.value,
                    })
                  }
                  className="h-11"
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Dùng để hiển thị nút &ldquo;Chỉ đường&rdquo; trên website.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal/10 bg-gradient-to-br from-teal/[0.03] to-transparent shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">Cho phép đặt bàn</div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ẩn/hiện trang đặt bàn cho khách hàng.
                  </p>
                </div>
                <Switch
                  checked={settingsForm.allow_booking}
                  onCheckedChange={(v) =>
                    setSettingsForm({ ...settingsForm, allow_booking: v })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
