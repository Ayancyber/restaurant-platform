"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizardStore } from "@/lib/store/wizard-store";
import { generateSQL } from "@/lib/sql/generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

type VerifyState =
  | { status: "idle" }
  | { status: "verifying" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function SupabaseStep() {
  const { data, updateData, _hasHydrated } = useWizardStore();
  const [mounted, setMounted] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [verify, setVerify] = useState<VerifyState>({ status: "idle" });

  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!_hasHydrated) return;
    setUrl(data.supabase.url);
    setAnonKey(data.supabase.anonKey);
    setServiceRoleKey(data.supabase.serviceRoleKey);
    setAdminEmail(data.supabase.adminEmail || "");
    setAdminPassword(data.supabase.adminPassword || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  // Validation
  const urlValid = url.startsWith("https://") && url.includes(".supabase.co");
  const anonKeyValid = anonKey.length > 40;
  const serviceRoleValid = serviceRoleKey.length > 40;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail);
  const passwordValid = adminPassword.length >= 8;

  const allValid =
    urlValid && anonKeyValid && serviceRoleValid && emailValid && passwordValid;

  // SQL regeneration reacts to admin fields
  const sql = useMemo(() => generateSQL(data), [data]);

  function persistSupabase(patch: Partial<typeof data.supabase>) {
    updateData("supabase", { ...data.supabase, ...patch });
  }

  function handleUrlChange(v: string) {
    setUrl(v);
    persistSupabase({ url: v, verified: false });
    setVerify({ status: "idle" });
  }

  function handleAnonKeyChange(v: string) {
    setAnonKey(v);
    persistSupabase({ anonKey: v, verified: false });
    setVerify({ status: "idle" });
  }

  function handleServiceRoleKeyChange(v: string) {
    setServiceRoleKey(v);
    persistSupabase({ serviceRoleKey: v });
  }

  function handleAdminEmailChange(v: string) {
    setAdminEmail(v);
    persistSupabase({ adminEmail: v });
  }

  function handleAdminPasswordChange(v: string) {
    setAdminPassword(v);
    persistSupabase({ adminPassword: v });
  }

  async function handleCopySQL() {
    try {
      await navigator.clipboard.writeText(sql);
      setSqlCopied(true);
      toast.success("SQL copied — paste in Supabase SQL Editor");
      setTimeout(() => setSqlCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy. Select manually.");
    }
  }

  async function handleVerify() {
    if (!url || !anonKey) {
      toast.error("Enter both Supabase URL and anon key first");
      return;
    }

    setVerify({ status: "verifying" });

    try {
      const res = await fetch("/api/verify-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, anonKey }),
      });
      const result = await res.json();

      if (result.ok) {
        setVerify({ status: "success", message: result.message });
        persistSupabase({ verified: true });
        toast.success("Supabase connected!");
      } else {
        setVerify({
          status: "error",
          message: result.error || "Verification failed",
        });
        persistSupabase({ verified: false });
      }
    } catch (err) {
      console.error(err);
      setVerify({
        status: "error",
        message: "Network error. Check your connection.",
      });
    }
  }

  if (!mounted || !_hasHydrated) {
    return <div className="h-96 animate-pulse bg-muted rounded-md" />;
  }

  const sqlPreview = sqlExpanded ? sql : sql.slice(0, 800) + "\n\n...";

  return (
    <div className="space-y-6">
      {/* ============ STEP 1: Create Supabase project ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              1
            </span>
            Create your Supabase project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Supabase is your free database, auth, and file storage — all in one.
            Takes about 60 seconds to set up.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Click the button below — opens Supabase dashboard</li>
            <li>Sign in with GitHub or email (free account)</li>
            <li>
              Click <span className="font-medium text-foreground">New Project</span>
            </li>
            <li>Pick any name (e.g. "my-restaurant") and a database password</li>
            <li>Choose a region close to you, then click Create</li>
            <li>Wait ~2 minutes for it to provision</li>
          </ol>
          <Button asChild variant="outline" className="gap-2 mt-2">
            <a
              href="https://supabase.com/dashboard/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Supabase Dashboard
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* ============ STEP 2: Fill credentials ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              2
            </span>
            Fill in your Supabase details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In Supabase, go to <span className="font-medium text-foreground">Settings → API</span>.
            Copy the three values below.
          </p>

          {/* Project URL */}
          <div className="space-y-2">
            <Label htmlFor="supabase-url">
              Project URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="supabase-url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://abcdefgh.supabase.co"
              className={`font-mono text-sm ${
                url && !urlValid ? "border-destructive" : ""
              }`}
            />
            {url && !urlValid && (
              <p className="text-xs text-destructive">
                Must be a valid Supabase URL (https://...supabase.co)
              </p>
            )}
            {!url && (
              <p className="text-xs text-muted-foreground">
                Starts with <code>https://</code>
              </p>
            )}
          </div>

          {/* Anon Key */}
          <div className="space-y-2">
            <Label htmlFor="anon-key">
              Anon Public Key <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="anon-key"
                value={anonKey}
                onChange={(e) => handleAnonKeyChange(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                type={showAnonKey ? "text" : "password"}
                className={`font-mono text-xs flex-1 ${
                  anonKey && !anonKeyValid ? "border-destructive" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAnonKey(!showAnonKey)}
              >
                {showAnonKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {anonKey && !anonKeyValid && (
              <p className="text-xs text-destructive">
                Anon key looks too short — did you copy the full key?
              </p>
            )}
            {!anonKey && (
              <p className="text-xs text-muted-foreground">
                The <span className="font-medium">anon</span> key — safe for the
                browser.
              </p>
            )}
          </div>

          {/* Service Role Key */}
          <div className="space-y-2">
            <Label htmlFor="service-key">
              Service Role Key <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="service-key"
                value={serviceRoleKey}
                onChange={(e) => handleServiceRoleKeyChange(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                type={showServiceRoleKey ? "text" : "password"}
                className={`font-mono text-xs flex-1 ${
                  serviceRoleKey && !serviceRoleValid ? "border-destructive" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowServiceRoleKey(!showServiceRoleKey)}
              >
                {showServiceRoleKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {serviceRoleKey && !serviceRoleValid && (
              <p className="text-xs text-destructive">
                Service role key looks too short.
              </p>
            )}
            {!serviceRoleKey && (
              <p className="text-xs text-muted-foreground">
                Needed for admin panel features. Keep secret — server only.
              </p>
            )}
          </div>

          <Separator />

          {/* Admin Account */}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Admin Account <span className="text-destructive">*</span>
            </p>
            <p className="text-xs text-muted-foreground">
              We&apos;ll create this admin user in your Supabase automatically.
              Use these credentials to log into your admin panel.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">
              Admin Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="admin-email"
              value={adminEmail}
              onChange={(e) => handleAdminEmailChange(e.target.value)}
              placeholder="admin@yourrestaurant.com"
              type="email"
              autoComplete="off"
              className={adminEmail && !emailValid ? "border-destructive" : ""}
            />
            {adminEmail && !emailValid && (
              <p className="text-xs text-destructive">
                Please enter a valid email address.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">
              Admin Password <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="admin-password"
                value={adminPassword}
                onChange={(e) => handleAdminPasswordChange(e.target.value)}
                placeholder="At least 8 characters"
                type={showAdminPassword ? "text" : "password"}
                autoComplete="off"
                className={`flex-1 ${
                  adminPassword && !passwordValid ? "border-destructive" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
              >
                {showAdminPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {adminPassword && !passwordValid && (
              <p className="text-xs text-destructive">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          {/* Not-all-valid hint */}
          {!allValid && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Fill in all 5 fields above (URL, anon key, service role key,
                admin email, admin password) to unlock the SQL below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ STEP 3: Copy SQL ============ */}
      <Card className={!allValid ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              3
            </span>
            Run the setup SQL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Custom SQL generated from your details. Creates all tables,
            security rules, seed data, and your admin user.
          </p>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Important: Choose &quot;Run without RLS&quot; in Supabase
              </p>
              <p className="text-muted-foreground mt-0.5">
                If a dialog appears saying &quot;Potential issues detected&quot;,
                choose{" "}
                <span className="font-medium text-foreground">
                  Run without RLS
                </span>{" "}
                — NOT &quot;Run and enable RLS&quot;. This SQL defines its own
                security policies.
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
              <div className="flex items-center gap-2 text-xs">
                <Database className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono">setup.sql</span>
                <Badge variant="secondary" className="text-[10px]">
                  {sql.split("\n").length} lines
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setSqlExpanded(!sqlExpanded)}
              >
                {sqlExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> Expand
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 text-[10px] leading-relaxed font-mono overflow-x-auto max-h-64 text-muted-foreground">
              {sqlPreview}
            </pre>
          </div>

          <Button
            type="button"
            onClick={handleCopySQL}
            className="w-full gap-2"
            size="lg"
          >
            {sqlCopied ? (
              <>
                <Check className="h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy SQL
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            Then in Supabase:
            <ol className="list-decimal list-inside mt-1.5 space-y-1">
              <li>
                Click{" "}
                <span className="font-medium text-foreground">SQL Editor</span>{" "}
                (left sidebar)
              </li>
              <li>Click "New query"</li>
              <li>Paste the SQL (Ctrl+V)</li>
              <li>
                Click{" "}
                <span className="font-medium text-foreground">Run</span> (or
                Ctrl+Enter)
              </li>
              <li>If prompted, choose &quot;Run without RLS&quot;</li>
            </ol>
          </div>

          <Separator />

          {/* Test Connection */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleVerify}
              disabled={verify.status === "verifying" || !url || !anonKey}
              size="lg"
              className="w-full gap-2"
            >
              {verify.status === "verifying" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            {verify.status === "success" && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Connected successfully
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {verify.message}
                  </p>
                </div>
              </div>
            )}

            {verify.status === "error" && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">
                    Connection failed
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {verify.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success summary */}
      {data.supabase.verified && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-700 dark:text-green-400">
                Database is ready
              </p>
              <p className="text-muted-foreground">
                Click Next to finish up and download your site.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
