# 🍜 Tiệm Người Quảng

> Website nhà hàng **Mì Quảng · Cao lầu · Bánh canh · Bún mọc** – Trực thuộc ẩm thực **Quảng Nam · Đà Nẵng** được thiết kế production-ready, UI cao cấp, mobile-first, sẵn sàng launch.

---

## ✨ Giới thiệu dự án

Dự án này là một website đầy đủ cho quán ăn **Tiệm Người Quảng** tại **269 Man Thiện, P. Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh**, chuyên cung cấp 4 món đặc sản truyền thống Quảng Nam.

Điểm nhấn:
- 🎨 **UI/UX cao cấp** với màu chủ đạo xanh Teal (#24A7A1) phối cùng nâu ấm và tone màu cream
- 📱 **Mobile-first responsive**, mượt cả desktop & smartphone
- 🚀 **Server-side rendering** cho SEO tốt (Google tìm thấy quán bạn dễ dàng)
- 💬 **Form đặt bàn & liên hệ** tích hợp validation client + server, không dùng API rườm rà
- 👨‍🍳 **Trang quản trị admin** giúp chủ quán dễ dàng cập nhật menu, giá, ảnh, giờ mở cửa, quản lý đặt bàn & tin nhắn khách hàng
- 📍 **Bản đồ Google Maps** embed đúng địa chỉ, kèm nút chỉ đường 1-click
- 🖼 **Upload ảnh menu / logo / bìa** ngay trong admin, không cần kiến thức kỹ thuật
- 🔎 **SEO hoàn chỉnh** – sitemap, robots, meta OG, Twitter Card, schema JSON-LD sẵn

---

## 🖼 Một vài điểm nhấn giao diện

### Trang chủ
- Hero banner giới thiệu thương hiệu, CTA "Đặt bàn" / "Xem menu" nổi bật
- Danh sách món **nổi bật** dạng card ảnh đẹp với giá VND (ví dụ: `45.000đ`)
- Mục **Về chúng tôi** 2 ảnh (ảnh bìa lớn + ảnh nhỏ góc dưới) + câu chuyện thương hiệu
- Giờ mở cửa 7 ngày tô sáng ô hôm nay
- CTA cuối trang kêu gọi đặt bàn tone gradient ấm

### Thực đơn
- Hiển thị toàn bộ món theo **danh mục** (Mì Quảng / Cao lầu / Bánh canh / Bún mọc)
- Lọc tìm kiếm client-side mượt mà
- Giá tiền format chuẩn VND

### Trang địa chỉ
- Thông tin đầy đủ: Địa chỉ · SĐT · Email · Website · Giờ mở cửa
- **Iframe Google Maps** ghim đúng vị trí số nhà
- 2 nút nhanh: **Chỉ đường** (mở Maps app) + **Gọi ngay** (native `tel:`)

### Đặt bàn / Liên hệ
- Form Zod validation tiếng Việt rõ ràng ("Mật khẩu ít nhất 6 ký tự", "Số điện thoại không hợp lệ"…)
- Toast Sonner feedback tức thì khi submit thành công
- Dữ liệu được lưu trực tiếp vào hệ thống để admin xem và xử lý

### Trang quản trị (admin)
- 🔐 **Đăng nhập an toàn** bằng email + mật khẩu
- Dashboard tổng quan (số món · số booking chờ · tin nhắn mới · booking gần nhất)
- CRUD menu: thêm/sửa/xóa món ăn, upload ảnh, set giá, set nổi bật, còn hàng
- CRUD danh mục, sắp xếp thứ tự
- Cập nhật giờ mở cửa 7 ngày chỉ bằng switch
- Quản lý đặt bàn: thay đổi trạng thái (chờ / đã xác nhận / hoàn thành / đã hủy)
- Hộp thư liên hệ: đánh dấu đã đọc / trả lời
- Thông tin cơ sở: tên, mô tả, logo, ảnh bìa, ảnh Về-chúng-tôi, địa chỉ, kinh độ / vĩ độ Maps, mạng xã hội (Facebook / Instagram / TikTok), Maps URL
- Đổi mật khẩu / đăng xuất an toàn

---

## 🛠 Công nghệ chính

| Lĩnh vực | Technology |
|---|---|
| **Framework** | Next.js 14 App Router · TypeScript strict |
| **Styling** | Tailwind CSS · shadcn/ui design system primitives |
| **Theme** | Teal #24A7A1 (accent xanh đậm miền biển Quảng) + Warm Brown + Cream |
| **Backend / Auth** | Supabase (Postgres · Auth · Storage) |
| **Server Data** | React Server Components mặc định + Server Actions cho đặt bàn / liên hệ |
| **Forms** | React Hook Form 7 + Zod (validate cả client lẫn server) |
| **Images** | next/image + Supabase Storage public bucket |
| **Feedback UX** | Sonner toasts · Lucide icons |
| **SEO** | Next Metadata API · robots.ts · sitemap.ts · OG/Twitter cards |

---

## 💡 Điểm nổi bật về kỹ thuật

1. **Server Components + Server Actions** – không cần setup REST API riêng; đặt bàn, gửi liên hệ đều qua Server Actions validate Zod.
2. **Middleware auth guard duy nhất** – redirect HTTP 303, chống loop 307 vĩnh viễn. Layout/page chỉ guard an toàn, **không tự redirect**.
3. **RLS (Row Level Security)** – chỉ staff có tài khoản admin mới sửa đổi dữ liệu. Quý khách công khai chỉ xem / gửi form.
4. **Image upload JPG/PNG/WEBP ≤ 5MB** – validate client trước khi gửi lên Storage, path pattern sạch: `{quánId}/{menu|logos|covers}/{timestamp}.jpg`.
5. **Slug NFD tiếng Việt** – tự động strip dấu (ví dụ: *"Cao lầu vị Quảng"* → `cao-lau-vi-quang`) cho URLs chuẩn SEO.
6. **Intl format tiền VND** – `Intl.NumberFormat('vi-VN')`, output chuẩn `45.000đ` (không format sai kiểu "₫" hoặc khoảng trắng lạ).

---

## ✅ Chạy trên máy của bạn

```bash
# 1. Cài
npm install

# 2. Copy .env.local và điền URL + Anon Key Supabase
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 3. Dev
npm run dev

# 4. Production build
npm run build
npm start
```

---

## 👤 Thông tin liên hệ

| Field | Info |
|---|---|
| Tên quán | **Tiệm Người Quảng** |
| Địa chỉ | 269 Man Thiện, P. Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh |
| Điện thoại | **0917 779 2815** |
| Email | tiemnguoiquang@gmail.com |
| Thực đơn chính | Mì Quảng · Cao lầu · Bánh canh · Bún mọc |

---

## 📸 Bản demo (preview)

> 🔗 Nếu deploy lên Vercel / Netlify sẽ có link public kèm ảnh chụp màn hình Hero, Menu, Location, Admin.

*— Cảm ơn bạn đã xem qua dự án này. Nếu bạn là chủ doanh nghiệp F&B đang cần một website đẹp, nhanh, ổn định, **Tiệm Người Quảng** chính là template bạn cần!* 🍜
