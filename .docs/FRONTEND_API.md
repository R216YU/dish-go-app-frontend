# Dish-Go API フロントエンド開発ドキュメント

## 概要

Dish-Go API は、Google Gemini AI を使用して料理レシピを生成する RESTful API です。
このドキュメントでは、フロントエンド開発に必要な API 仕様、型定義、使用例を提供します。

## ベース URL

- **開発環境**: `http://localhost:3000`
- **本番環境**: `https://{your-api-gateway-url}/Prod`

## エンドポイント一覧

| メソッド | パス       | 説明           |
| -------- | ---------- | -------------- |
| `GET`    | `/`        | ヘルスチェック |
| `POST`   | `/cooking` | レシピ生成     |

---

## API 仕様

### 1. ヘルスチェック

API が正常に動作しているか確認します。

**エンドポイント**

```
GET /
```

**レスポンス**

```json
{
  "message": "Hello Hono!"
}
```

---

### 2. レシピ生成

テキストまたは画像から料理レシピを生成します。

**エンドポイント**

```
POST /cooking
```

#### リクエスト

**Headers**

```
Content-Type: application/json
```

**Body Parameters**

| パラメーター        | 型        | 必須       | デフォルト | 制約              | 説明                                                           |
| ------------------- | --------- | ---------- | ---------- | ----------------- | -------------------------------------------------------------- |
| `text`              | `string`  | 条件付き\* | -          | -                 | ユーザーからのテキスト入力（食材リスト、料理のリクエストなど） |
| `image`             | `string`  | 条件付き\* | -          | Base64 エンコード | 冷蔵庫の写真などの Base64 エンコード画像データ                 |
| `recipeCount`       | `number`  | ❌         | `3`        | 1-5 の整数        | 生成するレシピの数                                             |
| `useAllIngredients` | `boolean` | ❌         | `false`    | -                 | `true`: すべての食材を使用、`false`: 一部でも可                |

\* **注意**: `text`または`image`のいずれか一方は必須です。両方を指定することも可能です。

**リクエスト例**

```json
{
  "text": "冷蔵庫にトマト、玉ねぎ、鶏肉、卵があります。時短で作れる夕食のレシピを提案してください。",
  "recipeCount": 3,
  "useAllIngredients": false
}
```

#### レスポンス

**成功時 (200 OK)**

```json
{
  "success": true,
  "message": "料理の提案を生成しました。",
  "data": [
    {
      "title": "鶏肉とトマトの炒め物",
      "difficulty": "簡単",
      "cookingTime": 20,
      "ingredients": [
        "鶏肉 300g",
        "トマト 2個",
        "玉ねぎ 1個",
        "卵 2個",
        "醤油 大さじ2",
        "サラダ油 大さじ1"
      ],
      "instructions": [
        "1. 鶏肉は一口大に切り、塩コショウで下味をつけます。",
        "2. トマトはくし切り、玉ねぎは薄切りにします。",
        "3. フライパンに油を熱し、鶏肉を炒めます。",
        "4. 鶏肉に火が通ったら、玉ねぎとトマトを加えて炒めます。",
        "5. 溶き卵を回し入れ、半熟状になったら完成です。"
      ]
    }
  ],
  "cached": false
}
```

**バリデーションエラー (400 Bad Request)**

```json
{
  "success": false,
  "message": "リクエストパラメーターが不正です。",
  "errors": [
    {
      "path": "recipeCount",
      "message": "Number must be less than or equal to 5"
    }
  ]
}
```

**画像認識失敗 (400 Bad Request)**

```json
{
  "success": false,
  "message": "画像から食材を認識できませんでした。",
  "code": "NO_INGREDIENTS"
}
```

**サーバーエラー (500 Internal Server Error)**

```json
{
  "success": false,
  "message": "Gemini AIからの応答が空です。"
}
```

---

## TypeScript 型定義

フロントエンドで使用するための型定義です。

### リクエスト型

```typescript
/**
 * レシピ生成リクエスト
 */
export interface CookingRequest {
  /** ユーザーからのテキスト入力 */
  text?: string;
  /** Base64エンコードされた画像データ */
  image?: string;
  /** 提案するレシピの数 (1〜5、デフォルト: 3) */
  recipeCount?: number;
  /** すべての食材を使用するか (デフォルト: false) */
  useAllIngredients?: boolean;
}
```

### レスポンス型

```typescript
/**
 * レシピの難易度
 */
export type Difficulty = "簡単" | "普通" | "難しい";

/**
 * レシピデータ
 */
export interface Recipe {
  /** 料理名 */
  title: string;
  /** 料理の難易度 */
  difficulty: Difficulty;
  /** 調理時間(分) */
  cookingTime: number;
  /** 材料のリスト（食材名 + 分量） */
  ingredients: string[];
  /** 調理手順のリスト（ナンバリング付き） */
  instructions: string[];
}

/**
 * 成功レスポンス
 */
export interface CookingSuccessResponse {
  success: true;
  message: string;
  data: Recipe[];
  /** キャッシュから取得したかどうか */
  cached: boolean;
}

/**
 * バリデーションエラー
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * エラーレスポンス
 */
export interface CookingErrorResponse {
  success: false;
  message: string;
  /** エラーコード（オプション） */
  code?: string;
  /** バリデーションエラー詳細（オプション） */
  errors?: ValidationError[];
  /** その他のエラー情報（オプション） */
  error?: string;
}

/**
 * レシピ生成APIレスポンス
 */
export type CookingResponse = CookingSuccessResponse | CookingErrorResponse;
```

---

## 使用例

### JavaScript/TypeScript (fetch)

```typescript
async function generateRecipes(
  request: CookingRequest
): Promise<CookingResponse> {
  const response = await fetch("https://your-api-url/cooking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: CookingErrorResponse = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// 使用例
try {
  const result = await generateRecipes({
    text: "冷蔵庫にトマト、玉ねぎ、鶏肉があります。",
    recipeCount: 2,
    useAllIngredients: false,
  });

  if (result.success) {
    console.log("生成されたレシピ:", result.data);
    console.log("キャッシュ利用:", result.cached);
  }
} catch (error) {
  console.error("エラー:", error);
}
```

### React (カスタムフック)

```typescript
import { useState } from "react";

interface UseRecipeGeneratorOptions {
  apiUrl: string;
}

export function useRecipeGenerator({ apiUrl }: UseRecipeGeneratorOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const generateRecipes = async (request: CookingRequest) => {
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
        return data;
      } else {
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "不明なエラー";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    recipes,
    loading,
    error,
    generateRecipes,
  };
}

// コンポーネントでの使用例
function RecipeForm() {
  const { recipes, loading, error, generateRecipes } = useRecipeGenerator({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await generateRecipes({
      text: "冷蔵庫にトマト、玉ねぎ、鶏肉があります。",
      recipeCount: 3,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>
          {loading ? "レシピ生成中..." : "レシピを生成"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {recipes.map((recipe, index) => (
        <div key={index}>
          <h3>{recipe.title}</h3>
          <p>難易度: {recipe.difficulty}</p>
          <p>調理時間: {recipe.cookingTime}分</p>
          <h4>材料</h4>
          <ul>
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
          <h4>手順</h4>
          <ol>
            {recipe.instructions.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
```

### 画像アップロードの例

```typescript
async function uploadImageAndGenerateRecipes(
  file: File
): Promise<CookingResponse> {
  // ファイルをBase64に変換
  const base64Image = await fileToBase64(file);

  // Base64のプレフィックスを削除 (data:image/jpeg;base64, の部分)
  const base64Data = base64Image.split(",")[1];

  return await generateRecipes({
    image: base64Data,
    recipeCount: 3,
    useAllIngredients: false,
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## エラーハンドリング

### エラーコード一覧

| コード           | HTTP ステータス | 説明                         | 対処方法                                         |
| ---------------- | --------------- | ---------------------------- | ------------------------------------------------ |
| -                | 400             | リクエストパラメーターが不正 | `errors`配列を確認してバリデーションエラーを修正 |
| `NO_INGREDIENTS` | 400             | 画像から食材を認識できない   | 別の画像を使用するか、テキスト入力を追加         |
| -                | 500             | Gemini AI からの応答が空     | しばらく待ってから再試行                         |
| -                | 500             | レシピのパースに失敗         | しばらく待ってから再試行                         |

### エラーハンドリングの例

```typescript
async function handleRecipeGeneration(request: CookingRequest) {
  try {
    const response = await fetch("/cooking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data: CookingResponse = await response.json();

    if (!data.success) {
      // エラーコード別の処理
      if (data.code === "NO_INGREDIENTS") {
        alert("画像から食材を認識できませんでした。別の画像をお試しください。");
      } else if (data.errors) {
        // バリデーションエラーの表示
        const errorMessages = data.errors
          .map((e) => `${e.path}: ${e.message}`)
          .join("\n");
        alert(`入力エラー:\n${errorMessages}`);
      } else {
        alert(`エラー: ${data.message}`);
      }
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("ネットワークエラー:", error);
    alert("ネットワークエラーが発生しました。接続を確認してください。");
    return null;
  }
}
```

---

## パフォーマンスの最適化

### キャッシュの活用

API はテキストベースのリクエストを 60 分間キャッシュします。同じリクエストを送信すると、`cached: true`が返され、即座にレスポンスが得られます。

```typescript
const response1 = await generateRecipes({ text: "鶏肉とトマト" });
// cached: false (初回リクエスト、AI呼び出しあり)

const response2 = await generateRecipes({ text: "鶏肉とトマト" });
// cached: true (キャッシュヒット、AI呼び出しなし、高速)
```

**注意**: 画像を含むリクエストはキャッシュされません。

### デバウンス処理

ユーザー入力に応じてリアルタイムでレシピを生成する場合は、デバウンス処理を実装してください。

```typescript
import { debounce } from "lodash";

const debouncedGenerateRecipes = debounce(async (text: string) => {
  await generateRecipes({ text, recipeCount: 3 });
}, 500); // 500ms待機

// 使用例
function SearchInput() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedGenerateRecipes(e.target.value);
  };

  return <input type="text" onChange={handleChange} />;
}
```

---

## ベストプラクティス

### 1. 画像サイズの制限

Lambda 関数のペイロード制限(6MB)を考慮し、画像をアップロードする前に圧縮してください。

```typescript
async function compressImage(
  file: File,
  maxSizeMB: number = 1
): Promise<string> {
  // 画像圧縮ライブラリ(browser-image-compressionなど)を使用
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(file, options);
  return await fileToBase64(compressedFile);
}
```

### 2. ローディング状態の表示

レシピ生成には数秒かかる場合があるため、必ずローディング状態を表示してください。

### 3. エラーメッセージのユーザーフレンドリー化

技術的なエラーメッセージをユーザーが理解しやすい形に変換してください。

```typescript
function getFriendlyErrorMessage(error: CookingErrorResponse): string {
  if (error.code === "NO_INGREDIENTS") {
    return "写真から食材を認識できませんでした。明るい場所で撮影した写真をお試しください。";
  }
  if (error.errors && error.errors.some((e) => e.path === "recipeCount")) {
    return "レシピの数は1〜5の間で指定してください。";
  }
  return "レシピの生成中にエラーが発生しました。しばらく待ってから再度お試しください。";
}
```

### 4. 型安全性の確保

TypeScript の型定義を活用して、コンパイル時にエラーを検出してください。

---

## テスト

### API テスト例 (Jest)

```typescript
import { describe, it, expect } from "@jest/globals";

describe("Cooking API", () => {
  const API_URL = "http://localhost:3000";

  it("should generate recipes from text", async () => {
    const response = await fetch(`${API_URL}/cooking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "トマトと卵",
        recipeCount: 2,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toHaveProperty("title");
    expect(data.data[0]).toHaveProperty("ingredients");
  });

  it("should return validation error for invalid recipeCount", async () => {
    const response = await fetch(`${API_URL}/cooking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "トマトと卵",
        recipeCount: 10, // 無効な値
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });
});
```

---

## サポート

ご質問や問題がある場合は、GitHub の Issue でお知らせください。
