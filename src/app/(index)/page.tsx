"use client";

import { useEffect, useRef } from "react";
import { RecipeForm } from "@/shared/components/RecipeForm";
import { RecipeList } from "@/shared/components/RecipeList";
import { useRecipeGenerator } from "@/shared/hooks/useRecipeGenerator";
import { Heading } from "@/shared/components/Heading";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background dark:from-green-950/10 dark:to-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* ヘッダー */}
        <header className="mb-16 text-center">
          <Heading level="h1" className="mb-6">
            Dish Go
          </Heading>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            冷蔵庫の食材を撮るだけで、レシピを自動生成！
          </p>
        </header>

        {/* レシピ生成フォーム */}
        <Card className="mb-16">
          <CardHeader>
            <Heading level="h3">レシピを生成</Heading>
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
