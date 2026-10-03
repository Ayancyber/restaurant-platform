import config from "./restaurant.config.json";

export type RestaurantConfig = typeof config;

export const restaurantConfig: RestaurantConfig = config;

export function themeToCssVars(cfg: RestaurantConfig): React.CSSProperties {
  return {
    "--primary": cfg.theme.primaryColor,
    "--accent": cfg.theme.accentColor,
    "--radius": cfg.theme.radius,
  } as React.CSSProperties;
}
