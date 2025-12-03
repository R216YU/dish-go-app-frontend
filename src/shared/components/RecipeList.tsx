import { Badge } from "@/shared/shadcn/components/ui/badge";
import type { Recipe } from "@/shared/types/api";
import { RecipeCard } from "./RecipeCard";
import { Heading } from "./Heading";

interface RecipeListProps {
  recipes: Recipe[];
  cached?: boolean;
}

export function RecipeList({ recipes, cached }: RecipeListProps) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Heading level="h3">生成されたレシピ</Heading>
        {cached && (
          <Badge variant="secondary" className="text-sm">
            キャッシュから取得
          </Badge>
        )}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.title} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
