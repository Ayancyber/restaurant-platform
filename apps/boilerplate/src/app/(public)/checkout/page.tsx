import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();
  if (!settings.features.onlineOrdering) {
    redirect("/menu");
  }
  return <CheckoutClient settings={settings} />;
}
