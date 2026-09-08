import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#24A7A1",
};

export async function generateMetadata(): Promise<Metadata> {
  const biz = await getBusinessBySlug(BUSINESS_SLUG);
  const settings = biz ? await getBusinessSettings(biz.id) : null;

  const title = biz
    ? `${biz.name} | Mì Quảng · Cao lầu · Bánh canh · Bún mọc`
    : "Tiệm Người Quảng | Mì Quảng · Cao lầu · Bánh canh · Bún mọc";
  const description = biz?.description
    ? biz.description
    : "Tiệm Người Quảng chuyên 4 món đặc sản Quảng Nam: Mì Quảng, Cao lầu, Bánh canh, Bún mọc với hương vị truyền thống tại Thủ Đức, TP.HCM.";

  return {
    title,
    description,
    keywords: [
      "Mì Quảng",
      "Cao lầu",
      "Bánh canh",
      "Bún mọc",
      "Quán ăn Quảng Nam",
      "Tiệm Người Quảng",
      "Món Quảng",
    ],
    authors: [{ name: biz?.name || "Tiệm Người Quảng" }],
    creator: biz?.name || "Tiệm Người Quảng",
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: settings?.google_maps_url || undefined,
      title,
      description,
      siteName: biz?.name || "Tiệm Người Quảng",
      images: biz?.cover_image_url
        ? [{ url: biz.cover_image_url, width: 1200, height: 630, alt: biz.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: biz?.cover_image_url ? [biz.cover_image_url] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
