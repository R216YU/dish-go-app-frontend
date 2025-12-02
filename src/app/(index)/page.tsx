"use client";

import { useEffect, useRef } from "react";
import { RecipeForm } from "@/shared/components/RecipeForm";
import { RecipeList } from "@/shared/components/RecipeList";
import { useRecipeGenerator } from "@/shared/hooks/useRecipeGenerator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/shadcn/components/ui/card";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const { recipes, loading, cached, generateRecipes } = useRecipeGenerator({
    apiUrl,
  });
  const recipeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && recipes.length > 0 && recipeListRef.current) {
      recipeListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [loading, recipes.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* ヘッダー */}
        <header className="mb-16 text-center">
          <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Dish Go
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            冷蔵庫の食材を撮るだけで、レシピを自動生成！
          </p>
        </header>

        {/* レシピ生成フォーム */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
              レシピを生成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecipeForm onSubmit={generateRecipes} loading={loading} />
          </CardContent>
        </Card>

        {/* レシピ一覧 */}
        {!loading && recipes.length > 0 && (
          <div ref={recipeListRef}>
            <RecipeList recipes={recipes} cached={cached} />
          </div>
        )}
      </div>
    </div>
  );
}
