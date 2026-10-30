"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { BookingPanel } from "./booking-form";

export function BookingWithParams(props: Omit<ComponentProps<typeof BookingPanel>, "initialService">) {
  const service = useSearchParams().get("service");
  return <BookingPanel {...props} initialService={service} />;
}
