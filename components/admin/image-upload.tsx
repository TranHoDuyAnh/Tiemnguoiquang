"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { validateImageFile, cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  businessId: string;
  folder?: "menu" | "logos" | "covers";
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  businessId,
  folder = "menu",
  label = "Tải ảnh lên",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      toast.error(validation.error || "File không hợp lệ");
      return;
    }

    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `${businessId}/${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from("business-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("business-assets")
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
      toast.success("Tải ảnh lên thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Tải ảnh thất bại. Vui lòng thử lại.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleRemove() {
    onChange(null);
    setPreviewUrl(null);
  }

  const displayUrl = value || previewUrl;

  return (
    <div className={cn("space-y-2", className)}>
      {displayUrl ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={displayUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
            <label className="cursor-pointer inline-flex items-center justify-center h-9 px-3 rounded-md bg-white text-gray-900 text-sm font-medium shadow-sm hover:bg-gray-100">
              <Upload className="h-4 w-4 mr-1.5" />
              Thay đổi
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700"
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-1.5" />
              Xóa
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-teal animate-spin" />
                <span className="text-sm text-gray-600 font-medium">
                  Đang tải lên...
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="block">
          <div
            className={cn(
              "w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-teal/40 hover:bg-teal/[0.02] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group",
              uploading && "opacity-50 pointer-events-none"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-teal animate-spin" />
                <span className="text-sm text-gray-600 font-medium">
                  Đang tải lên...
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-6 w-6 text-teal/70" />
                </div>
                <div className="text-center px-4">
                  <div className="text-sm font-medium text-gray-700 group-hover:text-teal">
                    {label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    JPG, PNG, WEBP · Tối đa 5MB
                  </div>
                </div>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
