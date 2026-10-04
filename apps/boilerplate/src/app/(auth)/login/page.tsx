import { LoginClient } from "./login-client";
import { restaurantConfig } from "@/config";

export default function LoginPage() {
  return <LoginClient brandName={restaurantConfig.brand.name} />;
}
