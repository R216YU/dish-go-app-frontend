"use client";

import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { RecipeCard } from "@/shared/components/RecipeCard";
import { RecipeForm } from "@/shared/components/RecipeForm";
import { useRecipeGenerator } from "@/shared/hooks/useRecipeGenerator";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const { recipes, loading, error, cached, generateRecipes, resetError } =
    useRecipeGenerator({
      apiUrl,
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* ヘッダー */}
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            🍳 Dish-Go
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
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
        <div className="mb-12 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            レシピを生成
          </h2>
          <RecipeForm onSubmit={generateRecipes} loading={loading} />
        </div>

        {/* ローディング */}
        {loading && <LoadingSpinner />}

        {/* レシピ一覧 */}
        {!loading && recipes.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                生成されたレシピ
              </h2>
              {cached && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  キャッシュから取得
                </span>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.title} recipe={recipe} />
              ))}
            </div>
          </div>
        )}

        {/* 初期表示メッセージ */}
        {!loading && recipes.length === 0 && !error && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <div className="text-6xl">👨‍🍳</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              レシピを生成してみましょう
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              食材や料理の希望を入力して、AIにレシピを提案してもらいましょう。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
