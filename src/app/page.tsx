"use client";

import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { RecipeCard } from "@/shared/components/RecipeCard";
import { RecipeForm } from "@/shared/components/RecipeForm";
import { useRecipeGenerator } from "@/shared/hooks/useRecipeGenerator";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/shadcn/components/ui/card";
import { Spinner } from "@/shared/shadcn/components/ui/spinner";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const { recipes, loading, error, cached, generateRecipes, resetError } =
    useRecipeGenerator({
      apiUrl,
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* ヘッダー */}
        <header className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 dark:text-white sm:text-6xl">
            Dish-Go
          </h1>
          <p className="text-xl leading-relaxed text-muted-foreground">
            冷蔵庫の食材からAIがレシピを提案
          </p>
        </header>

        {/* エラー表示 */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} onDismiss={resetError} />
          </div>
        )}

        {/* レシピ生成フォーム */}
        <Card className="mb-16">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">
              レシピを生成
            </CardTitle>
            <CardDescription className="text-base">
              食材や料理の希望を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <RecipeForm onSubmit={generateRecipes} loading={loading} />
          </CardContent>
        </Card>

        {/* ローディング */}
        {loading && <Spinner />}

        {/* レシピ一覧 */}
        {!loading && recipes.length > 0 && (
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
        )}

        {/* 初期表示メッセージ */}
        {!loading && recipes.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <h3 className="text-2xl font-semibold leading-tight">
                レシピを生成してみましょう
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                食材や料理の希望を入力して、AIにレシピを提案してもらいましょう。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
