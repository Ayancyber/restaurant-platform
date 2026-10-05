import {
  Store,
  Palette,
  Phone,
  ToggleRight,
  CreditCard,
  Database,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StepKey =
  | "brand"
  | "theme"
  | "contact"
  | "features"
  | "payments"
  | "supabase"
  | "export";

export type StepDefinition = {
  key: StepKey;
  number: number; // 1..7
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
};

export const STEPS: StepDefinition[] = [
  {
    key: "brand",
    number: 1,
    title: "Brand Identity",
    shortTitle: "Brand",
    description:
      "Restaurant name, tagline, hero punchline, and logo. This is what visitors see first.",
    icon: Store,
  },
  {
    key: "theme",
    number: 2,
    title: "Colors & Fonts",
    shortTitle: "Theme",
    description:
      "Pick your primary color, accent color, and typography. Live preview included.",
    icon: Palette,
  },
  {
    key: "contact",
    number: 3,
    title: "Contact & Hours",
    shortTitle: "Contact",
    description:
      "Phone, email, address, and opening hours for every day of the week.",
    icon: Phone,
  },
  {
    key: "features",
    number: 4,
    title: "Website Features",
    shortTitle: "Features",
    description:
      "Toggle which modules your site needs: online ordering, reservations, gallery, and more.",
    icon: ToggleRight,
  },
  {
    key: "payments",
    number: 5,
    title: "Payment Accounts",
    shortTitle: "Payments",
    description:
      "JazzCash, Easypaisa, and Cash on Delivery. Upload your QR codes so customers can pay.",
    icon: CreditCard,
  },
  {
    key: "supabase",
    number: 6,
    title: "Database Setup",
    shortTitle: "Database",
    description:
      "Create your Supabase project, paste the SQL we generate, and connect with your keys.",
    icon: Database,
  },
  {
    key: "export",
    number: 7,
    title: "Download Your Site",
    shortTitle: "Export",
    description:
      "Get your customized restaurant website as a ZIP — ready to deploy.",
    icon: Download,
  },
];

export function getStepByNumber(n: number): StepDefinition | undefined {
  return STEPS.find((s) => s.number === n);
}

export function getStepByKey(key: StepKey): StepDefinition | undefined {
  return STEPS.find((s) => s.key === key);
}
