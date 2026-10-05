"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WizardData = {
  brand: {
    name: string;
    tagline: string;
    heroPunchline: string;
    logoDataUrl: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  hours: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  features: {
    onlineOrdering: boolean;
    reservations: boolean;
    gallery: boolean;
  };
  paymentAccounts: {
    jazzcash: {
      enabled: boolean;
      accountName: string;
      accountNumber: string;
      qrCodeDataUrl: string;
    };
    easypaisa: {
      enabled: boolean;
      accountName: string;
      accountNumber: string;
      qrCodeDataUrl: string;
    };
    cod: {
      enabled: boolean;
    };
  };
  whatsapp: {
    enabled: boolean;
    number: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    verified: boolean;
    adminEmail: string;
    adminPassword: string;
  };
  currency: string;
  seo: {
    title: string;
    description: string;
  };
};

const defaultData: WizardData = {
  brand: { name: "", tagline: "", heroPunchline: "", logoDataUrl: "" },
  theme: {
    primaryColor: "#c2410c",
    accentColor: "#facc15",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
  },
  contact: { phone: "", email: "", address: "" },
  hours: [
    { day: "Monday", open: "11:00", close: "22:00", closed: false },
    { day: "Tuesday", open: "11:00", close: "22:00", closed: false },
    { day: "Wednesday", open: "11:00", close: "22:00", closed: false },
    { day: "Thursday", open: "11:00", close: "22:00", closed: false },
    { day: "Friday", open: "11:00", close: "23:30", closed: false },
    { day: "Saturday", open: "10:00", close: "23:30", closed: false },
    { day: "Sunday", open: "10:00", close: "21:00", closed: false },
  ],
  features: {
    onlineOrdering: true,
    reservations: true,
    gallery: true,
  },
  paymentAccounts: {
    jazzcash: {
      enabled: true,
      accountName: "",
      accountNumber: "",
      qrCodeDataUrl: "",
    },
    easypaisa: {
      enabled: true,
      accountName: "",
      accountNumber: "",
      qrCodeDataUrl: "",
    },
    cod: { enabled: true },
  },
  whatsapp: { enabled: true, number: "" },
  supabase: {
    url: "",
    anonKey: "",
    serviceRoleKey: "",
    verified: false,
    adminEmail: "",
    adminPassword: "",
  },
  currency: "PKR",
  seo: { title: "", description: "" },
};

type WizardStore = {
  currentStep: number;
  data: WizardData;
  _hasHydrated: boolean;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  updateData: <K extends keyof WizardData>(
    key: K,
    value: WizardData[K]
  ) => void;

  reset: () => void;
  setHasHydrated: (v: boolean) => void;
};

const TOTAL_STEPS = 7;

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      data: defaultData,
      _hasHydrated: false,

      setStep: (step) => {
        const clamped = Math.max(1, Math.min(TOTAL_STEPS, step));
        set({ currentStep: clamped });
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < TOTAL_STEPS) set({ currentStep: currentStep + 1 });
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) set({ currentStep: currentStep - 1 });
      },

      updateData: (key, value) =>
        set((state) => ({
          data: { ...state.data, [key]: value },
        })),

      reset: () => set({ currentStep: 1, data: defaultData }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "restaurant-builder-wizard",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export { TOTAL_STEPS };
