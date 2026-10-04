import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";
import { restaurantConfig } from "@/config";

export default function CheckoutPage() {
  // Feature flag check
  if (!restaurantConfig.features.onlineOrdering) {
    redirect("/menu");
  }

  return <CheckoutClient />;
}
