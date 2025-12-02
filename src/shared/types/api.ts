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
  /** 材料のリスト(食材名 + 分量) */
  ingredients: string[];
  /** 調理手順のリスト(ナンバリング付き) */
  instructions: string[];
}

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
  /** エラーコード(オプション) */
  code?: string;
  /** バリデーションエラー詳細(オプション) */
  errors?: ValidationError[];
  /** その他のエラー情報(オプション) */
  error?: string;
}

/**
 * レシピ生成APIレスポンス
 */
export type CookingResponse = CookingSuccessResponse | CookingErrorResponse;
