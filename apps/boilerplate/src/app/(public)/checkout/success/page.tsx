import Link from "next/link";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { restaurantConfig } from "@/config";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const { brand, contact } = restaurantConfig;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20">
      <Card>
        <CardContent className="p-10 text-center">
          <div className="mx-auto w-fit rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="font-heading text-3xl font-bold mt-6">
            Order Confirmed!
          </h1>

          <p className="mt-3 text-muted-foreground">
            Thank you for ordering from {brand.name}. We&apos;re preparing your
            meal now.
          </p>

          {order && (
            <div className="mt-6 rounded-lg bg-muted p-4 inline-block">
              <p className="text-xs text-muted-foreground">Order Number</p>
              <p className="font-mono text-lg font-semibold">{order}</p>
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            We&apos;ll contact you at{" "}
            <span className="font-medium text-foreground">{contact.phone}</span>{" "}
            if we need anything.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            {order && (
              <Button asChild size="lg" className="gap-2">
                <Link href={`/orders/${order}`}>
                  <Package className="h-4 w-4" />
                  Track Your Order
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/menu">
                Order More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
