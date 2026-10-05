import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function PlaceholderStep({ name }: { name: string }) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto w-fit rounded-full bg-muted p-4 mb-4">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-semibold">
          {name} — Coming Soon
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          This step will be built next. For now, use the Next button to
          preview the wizard flow.
        </p>
      </CardContent>
    </Card>
  );
}
