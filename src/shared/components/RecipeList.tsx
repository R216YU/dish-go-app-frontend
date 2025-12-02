import type { Recipe } from "@/shared/types/api";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import { RecipeCard } from "./RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  cached?: boolean;
}

export function RecipeList({ recipes, cached }: RecipeListProps) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold leading-tight">
          生成されたレシピ
        </h2>
        {cached && (
          <Badge variant="secondary" className="text-sm">
            キャッシュから取得
          </Badge>
        )}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.title} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
