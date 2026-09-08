"use server";

import { createBooking } from "@/lib/data/bookings";
import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";
import { z } from "zod";

const bookingSchema = z.object({
  customer_name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  booking_date: z.string().min(1, "Vui lòng chọn ngày"),
  booking_time: z.string().min(1, "Vui lòng chọn giờ"),
  guests: z.number().min(1, "Số khách phải lớn hơn 0"),
  note: z.string().optional(),
});

export async function submitBooking(formData: FormData) {
  const rawData = {
    customer_name: formData.get("customer_name") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || "",
    booking_date: formData.get("booking_date") as string,
    booking_time: formData.get("booking_time") as string,
    guests: Number(formData.get("guests")) || 0,
    note: (formData.get("note") as string) || undefined,
  };

  const validated = bookingSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      ok: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Vui lòng kiểm tra lại thông tin",
    };
  }

  const biz = await getBusinessBySlug(BUSINESS_SLUG);
  if (!biz) {
    return { ok: false, message: "Không thể kết nối hệ thống. Vui lòng thử lại." };
  }

  const settings = await getBusinessSettings(biz.id);
  if (settings && !settings.allow_booking) {
    return { ok: false, message: "Hệ thống đặt bàn tạm thời đóng. Vui lòng gọi điện trực tiếp." };
  }

  try {
    const result = await createBooking({
      business_id: biz.id,
      customer_name: validated.data.customer_name,
      phone: validated.data.phone,
      email: validated.data.email || null,
      booking_date: validated.data.booking_date,
      booking_time: validated.data.booking_time,
      guests: validated.data.guests,
      note: validated.data.note || null,
    });

    if (!result) {
      return { ok: false, message: "Không thể gửi yêu cầu. Vui lòng thử lại sau." };
    }

    return { ok: true, bookingId: result.id };
  } catch {
    return { ok: false, message: "Đã có lỗi xảy ra. Vui lòng thử lại sau." };
  }
}
