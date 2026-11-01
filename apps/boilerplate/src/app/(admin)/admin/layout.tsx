import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: `${settings.brand.name} Admin`,
  };
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const settings = await getSettings();

  return (
    <AdminShell
      userName={profile.full_name || profile.email || "Admin"}
      brandName={settings.brand.name}
      brandLogoUrl={settings.brand.logoUrl}
    >
      {children}
    </AdminShell>
  );
}
