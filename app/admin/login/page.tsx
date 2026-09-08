import Link from "next/link";
import LoginForm from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Admin",
  description: "Đăng nhập vào trang quản trị.",
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-brown via-[#3A2819] to-teal p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-warm-brown font-bold font-display text-xl shadow-lg">
              TNQ
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white mb-2">
            Trang quản trị
          </h1>
          <p className="text-white/70 text-sm">Tiệm Người Quảng</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-warm-brown mb-6">
            Đăng nhập
          </h2>
          <LoginForm />
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} Tiệm Người Quảng
        </p>
      </div>
    </div>
  );
}
