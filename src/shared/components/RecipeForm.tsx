"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/shared/shadcn/components/ui/button";
import type { CookingRequest } from "@/shared/types/api";
import { resizeAndConvertImage } from "@/shared/utils/image";

interface RecipeFormProps {
  onSubmit: (request: CookingRequest) => void;
  loading: boolean;
}

export function RecipeForm({ onSubmit, loading }: RecipeFormProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipeCount, setRecipeCount] = useState(3);
  const [useAllIngredients, setUseAllIngredients] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // プレビュー用
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // API送信用のBase64に変換(圧縮)
      const base64 = await resizeAndConvertImage(file);
      setImage(base64);
    } catch (error) {
      console.error("画像の処理に失敗しました:", error);
      alert("画像の処理に失敗しました。別の画像をお試しください。");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text && !image) {
      alert("テキストまたは画像のいずれかを入力してください。");
      return;
    }

    const request: CookingRequest = {
      text: text || undefined,
      image: image || undefined,
      recipeCount,
      useAllIngredients,
    };

    onSubmit(request);
  };

  const handleReset = () => {
    setText("");
    setImage(null);
    setImagePreview(null);
    setRecipeCount(3);
    setUseAllIngredients(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="text"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          食材や料理の希望を入力
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: 冷蔵庫にトマト、玉ねぎ、鶏肉があります。時短で作れる夕食のレシピを提案してください。"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="image"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          冷蔵庫の写真をアップロード(オプション)
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {imagePreview && (
          <div className="relative mt-2 h-48 w-full">
            <Image
              src={imagePreview}
              alt="アップロードプレビュー"
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="recipeCount"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            レシピ数: {recipeCount}
          </label>
          <input
            id="recipeCount"
            type="range"
            min="1"
            max="5"
            value={recipeCount}
            onChange={(e) => setRecipeCount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            id="useAllIngredients"
            type="checkbox"
            checked={useAllIngredients}
            onChange={(e) => setUseAllIngredients(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label
            htmlFor="useAllIngredients"
            className="ml-2 text-sm text-gray-900 dark:text-white"
          >
            すべての食材を使用
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? "レシピ生成中..." : "レシピを生成"}
        </Button>
        <Button
          type="button"
          onClick={handleReset}
          disabled={loading}
          variant="outline"
        >
          リセット
        </Button>
      </div>
    </form>
  );
}
