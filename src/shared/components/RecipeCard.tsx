import { Badge } from "@/shared/shadcn/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/shadcn/components/ui/card";
import type { Recipe } from "@/shared/types/api";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold leading-tight">
          {recipe.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {recipe.difficulty}
          </Badge>
          <span className="text-base leading-snug">{recipe.cookingTime}分</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h4 className="mb-3 text-base font-semibold leading-snug">材料</h4>
          <ul className="list-inside list-disc space-y-2 text-base leading-relaxed text-muted-foreground">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-base font-semibold leading-snug">作り方</h4>
          <ol className="space-y-3 text-base leading-relaxed text-muted-foreground">
            {recipe.instructions.map((instruction) => {
              const match = instruction.match(/^(\d+)\.\s*(.*)$/);
              const number = match ? match[1] : "";
              const text = match ? match[2] : instruction;
              return (
                <li key={instruction} className="flex gap-2">
                  <span className="font-semibold text-primary">{number}.</span>
                  <span>{text}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
