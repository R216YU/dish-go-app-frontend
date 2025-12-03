"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/shadcn/components/ui/select";
import { Textarea } from "@/shared/shadcn/components/ui/textarea";
import type { CookingRequest } from "@/shared/types/api";
import { resizeAndConvertImage } from "@/shared/utils/image";
import { Spinner } from "../shadcn/components/ui/spinner";

const UNIT_OPTIONS = ["個", "本", "枚", "g", "ml", "束", "適量"] as const;

const recipeFormSchema = z.object({
  image: z.string().optional(),
  manualIngredient: z.string().default(""),
  ingredientQuantity: z.string().default(""),
  ingredientUnit: z.enum(UNIT_OPTIONS).default(UNIT_OPTIONS[0]),
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
      toast.error("画像の処理に失敗しました。別の画像をお試しください。");
    }
  };

  const handleAddIngredient = () => {
    const ingredientName = form.getValues("manualIngredient");
    const quantity = form.getValues("ingredientQuantity");
    const unit = form.getValues("ingredientUnit");

    if (!ingredientName || ingredientName.trim() === "") {
      toast.error("食材名を入力してください。");
      return;
    }

    if (ingredientName?.trim()) {
      let newIngredient: string;
      if (quantity?.trim()) {
        // 個数が入力されている場合
        newIngredient = `${ingredientName} ${quantity}${unit}`;
      } else if (unit === "適量") {
        // 個数なしで「適量」の場合
        newIngredient = `${ingredientName} 適量`;
      } else {
        // 個数なしで他の単位の場合は単位を表示しない
        newIngredient = ingredientName;
      }
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
      toast.info(
        "画像のアップロードまたは食材の入力のいずれかを行ってください。"
      );
      return;
    }

    // テキストリクエストの構築
    let textRequest = "";
    if (ingredients.length > 0) {
      textRequest = `食材: ${ingredients.join(", ")}`;
    }
    if (values.additionalRequest?.trim()) {
      textRequest += textRequest
        ? `\n${values.additionalRequest}`
        : values.additionalRequest;
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
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        {/* メイン: 写真アップロードエリア */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-bold sm:text-xl">
                冷蔵庫の写真をアップロード
              </FormLabel>
              <FormControl>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <label
                      htmlFor="image-upload"
                      className="flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-4 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 transition-all hover:border-green-400 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100 dark:border-green-700 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:hover:border-green-600 sm:h-64"
                    >
                      <Upload className="mb-3 h-12 w-12 text-green-600 dark:text-green-500" />
                      <span className="text-base font-semibold text-green-700 dark:text-green-400 sm:text-lg">
                        ここをクリックして写真を選択
                      </span>
                      <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                        食材の写真から自動でレシピを生成します
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
                    <div className="relative h-56 w-full overflow-hidden rounded-xl border-2 border-green-200 shadow-lg sm:h-64 sm:w-64">
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

        {/* 手入力で食材を追加・補完 */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <div>
            <Label className="text-base font-semibold sm:text-lg">
              食材を追加・補完
            </Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              写真に写っていない食材や、追加で使いたい食材を入力できます
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* 食材名 - スマホでは1行目、PCでは左側 */}
            <FormField
              control={form.control}
              name="manualIngredient"
              render={({ field }: { field: any }) => (
                <FormItem className="w-full sm:flex-[5]">
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="例: トマト、玉ねぎ"
                      className="text-xs sm:text-sm"
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
            {/* 個数・単位・追加ボタン - スマホでは2行目、PCでは右側 */}
            <div className="flex gap-2 sm:flex-[5]">
              <FormField
                control={form.control}
                name="ingredientQuantity"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="個数"
                        className="text-xs sm:text-sm"
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
                  <FormItem className="w-16 sm:w-20 md:w-24">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                className="w-16 sm:w-20 md:w-24 text-xs sm:text-sm"
              >
                追加
              </Button>
            </div>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-green-100 px-3 py-1 text-xs hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 sm:text-sm"
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

        {/* レシピに対する要望 */}
        <FormField
          control={form.control}
          name="additionalRequest"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold sm:text-lg">
                レシピに対する要望（任意）
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="例: 時短で作れる料理、辛めの味付け、子供向けなど"
                  rows={5}
                  className="text-sm sm:text-base"
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
            className="flex-1 bg-green-600 py-6 text-base font-bold transition-colors duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:text-lg"
          >
            {loading ? <Spinner /> : "レシピを生成"}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={loading}
            variant="outline"
            className="py-6 text-base font-medium transition-colors duration-200 hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 sm:text-lg"
          >
            リセット
          </Button>
        </div>
      </form>
    </Form>
  );
}
