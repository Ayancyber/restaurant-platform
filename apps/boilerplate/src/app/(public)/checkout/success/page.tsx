import Link from "next/link";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurantConfig } from "@/config";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { order, token } = await searchParams;
  const { brand, contact } = restaurantConfig;

  return (
    <main className="min-h-[75vh] bg-[#faf8f4] px-5 py-20 text-[#30251f] sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d8c6b5] bg-[#f1e9df]">
          <CheckCircle2 className="h-10 w-10 text-[#8f4932]" strokeWidth={1.4} />
        </div>

        <p className="mt-9 text-[10px] uppercase tracking-[0.26em] text-[#a16b4e]">
          A little something to look forward to
        </p>
        <h1 className="mt-4 font-heading text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
          Your order is
          <br />
          confirmed<span className="text-[#a65e40]">.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-[#817469]">
          Thank you for choosing {brand.name}. We’ve received your order and
          are getting things ready.
        </p>

        {order && (
          <div className="mx-auto mt-9 max-w-sm border-y border-[#e2d8cb] py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a8b7c]">
              Your order number
            </p>
            <p className="mt-2 font-mono text-2xl tracking-wide text-[#8f4932]">
              {order}
            </p>
          </div>
        )}

        <p className="mt-7 text-xs leading-6 text-[#817469]">
          Need to reach us? We’re just a call away at{" "}
          <a href={`tel:${contact.phone}`} className="font-medium text-[#8f4932] underline underline-offset-4">
            {contact.phone}
          </a>
          .
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {(token || order) && (
            <Button asChild size="lg" className="h-12 gap-2 rounded-none bg-[#8f4932] px-7 text-xs uppercase tracking-[0.14em] hover:bg-[#713923]">
              <Link href={`/orders/${token || order}`}>
                <Package className="h-4 w-4" />
                Track your order
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline" className="h-12 rounded-none border-[#d9cfc2] bg-transparent px-7 text-xs uppercase tracking-[0.14em] text-[#55483e] hover:bg-[#f1e9df]">
            <Link href="/menu">
              Order more <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Link href="/" className="mt-8 inline-block text-[10px] uppercase tracking-[0.18em] text-[#8b7b6d] transition-colors hover:text-[#9a5639]">
          Return to home
        </Link>
      </div>
    </main>
  );
}
