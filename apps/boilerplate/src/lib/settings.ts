import { createClient } from "@/lib/supabase/server";
import { restaurantConfig, type RestaurantConfig } from "@/config";

/**
 * Load restaurant settings, merging DB overrides over config.json defaults.
 * Use this in server components instead of importing restaurantConfig directly.
 */
export async function getSettings(): Promise<RestaurantConfig> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!data || data.length === 0) {
      return restaurantConfig;
    }

    const overrides: Record<string, unknown> = {};
    for (const row of data) {
      overrides[row.key] = row.value;
    }

    // Deep merge: DB overrides win
    return deepMerge(
      restaurantConfig as unknown as Record<string, unknown>,
      overrides
    ) as unknown as RestaurantConfig;
  } catch (err) {
    console.error("Failed to load settings, using defaults:", err);
    return restaurantConfig;
  }
}

function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      overrideVal &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>
      );
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }
  return result;
}
