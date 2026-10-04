import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { ReservationClient } from "./reservation-client";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const settings = await getSettings();
  if (!settings.features.reservations) {
    redirect("/");
  }
  return <ReservationClient settings={settings} />;
}
