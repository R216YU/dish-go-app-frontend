import { Card, CardContent } from "@/shared/shadcn/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-16 text-center">
        <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
