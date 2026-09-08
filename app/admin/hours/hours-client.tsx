"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { BusinessHour } from "@/lib/types";
import { DAY_OF_WEEK_NAMES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

type FormHour = {
  id?: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
};

const orderedDays = [1, 2, 3, 4, 5, 6, 0];

function formatTimeForInput(t: string | null | undefined): string {
  if (!t) return "10:00";
  if (t.length >= 5) return t.slice(0, 5);
  return t;
}

export function HoursClient({
  initialHours,
  businessId,
}: {
  initialHours: BusinessHour[] | null;
  businessId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const todayIndex = new Date().getDay();

  const buildInitial = (): FormHour[] => {
    const base: FormHour[] = orderedDays.map((dow) => ({
      day_of_week: dow,
      is_open: true,
      open_time: "10:00",
      close_time: "22:00",
    }));
    if (!initialHours) return base;
    for (const h of initialHours) {
      const idx = base.findIndex((b) => b.day_of_week === h.day_of_week);
      if (idx !== -1) {
        base[idx] = {
          id: h.id,
          day_of_week: h.day_of_week,
          is_open: h.is_open ?? true,
          open_time: formatTimeForInput(h.open_time),
          close_time: formatTimeForInput(h.close_time),
        };
      }
    }
    return base;
  };

  const [formHours, setFormHours] = useState<FormHour[]>(buildInitial);

  const updateHour = (dow: number, patch: Partial<FormHour>) => {
    setFormHours((prev) =>
      prev.map((h) => (h.day_of_week === dow ? { ...h, ...patch } : h))
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const payloads = formHours.map((h) => ({
          id: h.id,
          business_id: businessId,
          day_of_week: h.day_of_week,
          is_open: h.is_open,
          open_time: h.is_open ? `${h.open_time}:00` : null,
          close_time: h.is_open ? `${h.close_time}:00` : null,
        }));
        const { error } = await supabase.from("business_hours").upsert(payloads, {
          onConflict: "business_id,day_of_week",
        });
        if (error) throw error;
        toast.success("Đã lưu giờ mở cửa");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || "Lỗi khi lưu");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Giờ mở cửa</CardTitle>
            <CardDescription>
              Quản lý thời gian mở cửa 7 ngày trong tuần.
            </CardDescription>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="shrink-0">
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {formHours.map((h) => {
            const isToday = h.day_of_week === todayIndex;
            return (
              <div
                key={h.day_of_week}
                className={
                  "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between " +
                  (isToday
                    ? "border-teal/40 bg-teal/5 ring-1 ring-teal/20"
                    : "border-warm-brown/10 bg-cream")
                }
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Switch
                    checked={h.is_open}
                    onCheckedChange={(v) => updateHour(h.day_of_week, { is_open: v })}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-semibold text-warm-brown-900">
                        {DAY_OF_WEEK_NAMES[h.day_of_week]}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
                          Hôm nay
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-warm-brown-600">
                      {h.is_open ? "Đang mở cửa" : "Đóng cửa"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`open-${h.day_of_week}`} className="w-16 shrink-0 text-xs text-warm-brown-600">
                      Mở cửa
                    </Label>
                    <Input
                      id={`open-${h.day_of_week}`}
                      type="time"
                      disabled={!h.is_open}
                      value={h.open_time}
                      onChange={(e) =>
                        updateHour(h.day_of_week, { open_time: e.target.value })
                      }
                      className="w-36"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`close-${h.day_of_week}`} className="w-16 shrink-0 text-xs text-warm-brown-600">
                      Đóng cửa
                    </Label>
                    <Input
                      id={`close-${h.day_of_week}`}
                      type="time"
                      disabled={!h.is_open}
                      value={h.close_time}
                      onChange={(e) =>
                        updateHour(h.day_of_week, { close_time: e.target.value })
                      }
                      className="w-36"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function HoursClientSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </CardContent>
    </Card>
  );
}
