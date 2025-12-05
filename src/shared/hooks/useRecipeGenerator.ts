"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CookingRequest, CookingResponse, Recipe } from "@/shared/types/api";

interface UseRecipeGeneratorOptions {
  apiUrl: string;
}

interface UseRecipeGeneratorReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  cached: boolean;
  generateRecipes: (request: CookingRequest) => Promise<CookingResponse | null>;
  resetError: () => void;
}

/**
 * レシピ生成APIを呼び出すカスタムフック
 */
export function useRecipeGenerator({
  apiUrl,
}: UseRecipeGeneratorOptions): UseRecipeGeneratorReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cached, setCached] = useState(false);

  const resetError = () => {
    setError(null);
  };

  const generateRecipes = async (request: CookingRequest): Promise<CookingResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/cooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data: CookingResponse = await response.json();

      if (data.success) {
        setRecipes(data.data);
        setCached(data.cached);
        return data;
      }

      // エラーレスポンスの処理
      let errorMessage = data.message;

      if (data.code === "NO_INGREDIENTS") {
        errorMessage =
          "写真から食材を認識できませんでした。明るい場所で撮影した写真をお試しください。";
      } else if (data.errors && data.errors.length > 0) {
        errorMessage = `入力エラー: ${data.errors.map((e) => e.message).join(", ")}`;
      }

      toast.error("エラーが発生しました");
      setError(errorMessage);
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "ネットワークエラーが発生しました。接続を確認してください。";
      toast.error("接続エラー");
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    recipes,
    loading,
    error,
    cached,
    generateRecipes,
    resetError,
  };
}
