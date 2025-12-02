"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/shared/shadcn/components/ui/button";
import { Checkbox } from "@/shared/shadcn/components/ui/checkbox";
import { Input } from "@/shared/shadcn/components/ui/input";
import { Label } from "@/shared/shadcn/components/ui/label";
import { Slider } from "@/shared/shadcn/components/ui/slider";
import { Textarea } from "@/shared/shadcn/components/ui/textarea";
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4">
        <Label htmlFor="text" className="text-base font-medium leading-snug">
          食材や料理の希望を入力
        </Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: 冷蔵庫にトマト、玉ねぎ、鶏肉があります。時短で作れる夕食のレシピを提案してください。"
          rows={4}
          className="text-base leading-relaxed"
        />
      </div>

      <div className="grid gap-4">
        <Label htmlFor="image" className="text-base font-medium leading-snug">
          冷蔵庫の写真をアップロード(オプション)
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-base"
        />
        {imagePreview && (
          <div className="relative mt-4 h-56 w-full overflow-hidden rounded-lg border shadow-sm">
            <Image
              src={imagePreview}
              alt="アップロードプレビュー"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="grid gap-4">
          <Label
            htmlFor="recipeCount"
            className="text-base font-medium leading-snug"
          >
            レシピ数: <span className="font-semibold">{recipeCount}</span>
          </Label>
          <Slider
            id="recipeCount"
            min={1}
            max={5}
            step={1}
            value={[recipeCount]}
            onValueChange={(value) => setRecipeCount(value[0])}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="useAllIngredients"
            checked={useAllIngredients}
            onCheckedChange={(checked) =>
              setUseAllIngredients(checked === true)
            }
          />
          <Label
            htmlFor="useAllIngredients"
            className="text-base font-normal leading-snug"
          >
            すべての食材を使用
          </Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-base font-medium transition-colors duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "レシピ生成中..." : "レシピを生成"}
        </Button>
        <Button
          type="button"
          onClick={handleReset}
          disabled={loading}
          variant="outline"
          className="text-base font-medium transition-colors duration-200 hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          リセット
        </Button>
      </div>
    </form>
  );
}
