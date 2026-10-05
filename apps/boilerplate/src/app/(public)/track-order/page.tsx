import { getSettings } from "@/lib/settings";
import { TrackOrderClient } from "./track-order-client";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage() {
  const settings = await getSettings();
  return <TrackOrderClient settings={settings} />;
}
