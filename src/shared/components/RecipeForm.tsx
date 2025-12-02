"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import { Button } from "@/shared/shadcn/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/shadcn/components/ui/form";
import { Input } from "@/shared/shadcn/components/ui/input";
import { Label } from "@/shared/shadcn/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/shadcn/components/ui/native-select";
import { Textarea } from "@/shared/shadcn/components/ui/textarea";
import type { CookingRequest } from "@/shared/types/api";
import { resizeAndConvertImage } from "@/shared/utils/image";
import { Spinner } from "../shadcn/components/ui/spinner";

const UNIT_OPTIONS = ["個", "本", "枚", "g", "ml", "束", "適量"] as const;

const recipeFormSchema = z.object({
  image: z.string().optional(),
  manualIngredient: z.string().default(""),
  ingredientQuantity: z.string().default(""),
  ingredientUnit: z.literal(UNIT_OPTIONS).default(UNIT_OPTIONS[0]),
  additionalRequest: z.string().default(""),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  onSubmit: (request: CookingRequest) => void;
  loading: boolean;
}

export function RecipeForm({ onSubmit, loading }: RecipeFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema) as any,
    defaultValues: {
      image: undefined,
      manualIngredient: "",
      ingredientQuantity: "",
      ingredientUnit: UNIT_OPTIONS[0],
      additionalRequest: "",
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // プレビュー用
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // API送信用のBase64に変換(圧縮)
      const base64 = await resizeAndConvertImage(file);
      form.setValue("image", base64);
    } catch (error) {
      console.error("画像の処理に失敗しました:", error);
      alert("画像の処理に失敗しました。別の画像をお試しください。");
    }
  };

  const handleAddIngredient = () => {
    const ingredientName = form.getValues("manualIngredient");
    const quantity = form.getValues("ingredientQuantity");
    const unit = form.getValues("ingredientUnit");

    if (ingredientName?.trim()) {
      const newIngredient = quantity?.trim()
        ? `${ingredientName} ${quantity}${unit}`
        : `${ingredientName} (${unit})`;
      setIngredients([...ingredients, newIngredient]);
      form.setValue("manualIngredient", "");
      form.setValue("ingredientQuantity", "");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (values: RecipeFormValues) => {
    if (!values.image && ingredients.length === 0) {
      alert("画像のアップロードまたは食材の入力のいずれかを行ってください。");
      return;
    }

    // テキストリクエストの構築
    let textRequest = "";
    if (ingredients.length > 0) {
      textRequest = `食材: ${ingredients.join(", ")}`;
    }
    if (values.additionalRequest?.trim()) {
      textRequest += textRequest ? `\n${values.additionalRequest}` : values.additionalRequest;
    }

    const request: CookingRequest = {
      text: textRequest || undefined,
      image: values.image || undefined,
      recipeCount: 3,
      useAllIngredients: false,
    };

    onSubmit(request);
  };

  const handleReset = () => {
    form.reset();
    setImagePreview(null);
    setIngredients([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 写真アップロードエリア */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-medium">冷蔵庫の写真をアップロード</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="image-upload"
                      className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <Upload className="mb-2 h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        クリックして画像を選択
                      </span>
                    </label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <div className="relative h-40 w-40 overflow-hidden rounded-lg border shadow-sm">
                      <Image
                        src={imagePreview}
                        alt="アップロードプレビュー"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 手入力で食材追加 */}
        <div className="space-y-4">
          <Label className="text-base font-medium">手入力で食材を追加</Label>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="manualIngredient"
              render={({ field }: { field: any }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="例: トマト、玉ねぎ"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddIngredient();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ingredientQuantity"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="個数"
                      className="w-20"
                      min="0"
                      step="0.1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddIngredient();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ingredientUnit"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormControl>
                    <NativeSelect {...field} className="w-24">
                      {UNIT_OPTIONS.map((option) => (
                        <NativeSelectOption key={option} value={option}>
                          {option}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              onClick={handleAddIngredient}
              variant="outline"
              disabled={loading}
            >
              追加
            </Button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-green-100 px-3 py-1 text-sm hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
                >
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="ml-1 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                    disabled={loading}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 手入力でレシピに対する細かい要望 */}
        <FormField
          control={form.control}
          name="additionalRequest"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">レシピに対する細かい要望</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="例: 時短で作れる料理、辛めの味付け、子供向けなど"
                  rows={4}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* レシピ作成ボタン & リセットボタン */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-base font-medium transition-colors duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <Spinner /> : "レシピを生成"}
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
    </Form>
  );
}
