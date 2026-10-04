import { redirect } from "next/navigation";
import { ReservationClient } from "./reservation-client";
import { restaurantConfig } from "@/config";

export default function ReservationsPage() {
  if (!restaurantConfig.features.reservations) {
    redirect("/");
  }
  return <ReservationClient />;
}
