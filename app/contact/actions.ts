"use server";

import { createContactMessage } from "@/lib/data/messages";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().min(2, "Tiêu đề ít nhất 2 ký tự"),
  message: z.string().min(10, "Tin nhắn quá ngắn (ít nhất 10 ký tự)"),
});

export async function submitContact(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const validated = contactSchema.safeParse(rawData);
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

  try {
    const result = await createContactMessage({
      business_id: biz.id,
      name: validated.data.name,
      email: validated.data.email || null,
      phone: validated.data.phone || null,
      subject: validated.data.subject,
      message: validated.data.message,
    });

    if (!result) {
      return { ok: false, message: "Không thể gửi tin nhắn. Vui lòng thử lại." };
    }

    return { ok: true, id: result.id };
  } catch {
    return { ok: false, message: "Đã có lỗi xảy ra. Vui lòng thử lại sau." };
  }
}
