# Dish Go - レシピ自動生成アプリ

冷蔵庫の食材を撮影するだけで、AI が自動的にレシピを生成する Next.js アプリケーションです。

## 概要

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **UI ライブラリ**: shadcn/ui + Tailwind CSS
- **状態管理**: React Hooks (将来的に zustand 検討中)
- **パッケージマネージャー**: pnpm

## Getting Started

開発サーバーを起動:

```bash
pnpm dev
```

ブラウザで [http://localhost:3001](http://localhost:3001) を開く。

ブラウザで [http://localhost:3001](http://localhost:3001) を開く。

## プロジェクト構造

```
dish-go-app-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── globals.css         # グローバルスタイル
│   │   └── (index)/            # ホームページ
│   │       ├── page.tsx        # メインページ
│   │       └── components/     # ページ固有コンポーネント
│   └── shared/                 # 共有リソース
│       ├── components/         # 共通コンポーネント
│       │   ├── RecipeCard.tsx
│       │   ├── RecipeForm.tsx
│       │   └── RecipeList.tsx
│       ├── hooks/              # カスタムフック
│       │   └── useRecipeGenerator.ts
│       ├── shadcn/             # shadcn/ui コンポーネント
│       ├── types/              # TypeScript型定義
│       │   └── api.ts
│       └── utils/              # ユーティリティ関数
├── public/                     # 静的ファイル
└── 設定ファイル群
```

## 主要機能

### 1. レシピ生成

- テキスト入力または画像アップロードで食材を指定
- レシピ数(1-5)と難易度のカスタマイズ
- すべての食材を使用するオプション
- AI によるレシピ自動生成

### 2. 将来の機能拡張計画

#### レシピ履歴機能 (実装予定)

**目的**: ブラウザのローカル保存領域を使用して、過去のレシピ生成結果を保存・閲覧・削除できるようにする。

##### 実装方法の調査結果 (2025 年 12 月 3 日)

複数の実装方法を調査し、以下の結論に至りました:

**選択肢の比較:**

| 方法                  | メリット                                    | デメリット               | 適用シナリオ           |
| --------------------- | ------------------------------------------- | ------------------------ | ---------------------- |
| **localStorage**      | シンプル、同期的、5-10MB 容量、追加依存なし | 文字列のみ、同期処理     | 中規模データに最適     |
| **IndexedDB**         | 大容量(50MB+)、非同期、構造化データ対応     | API 複雑、実装コスト高   | 大量データ・複雑クエリ |
| **sessionStorage**    | シンプル                                    | タブを閉じると消える     | 履歴保存に不適         |
| **zustand + persist** | 状態管理統合、TypeScript 対応、軽量(3KB)    | 新規依存追加             | 状態管理の統一         |
| **localForage**       | 自動フォールバック、Promise API             | 依存増加、非同期で複雑化 | 互換性重視             |

**最終決定: zustand + persist** ✅

**選定理由:**

1. 状態管理と永続化を統一できる
2. TypeScript 完全対応で型安全性が高い
3. localStorage を自動管理、ボイラープレートが少ない
4. 軽量(3KB)で既存アプリへの影響が小さい
5. 将来的な状態管理の拡張性が高い

##### 実装ガイド

**1. 依存関係のインストール**

```bash
pnpm add zustand
```

**2. 型定義の追加**

`src/shared/types/history.ts` を作成:

```typescript
import type { CookingRequest, Recipe } from "./api";

/**
 * レシピ生成履歴
 */
export interface RecipeHistory {
  /** ユニークID */
  id: string;
  /** 保存日時(Unixタイムスタンプ) */
  timestamp: number;
  /** 元のリクエスト */
  request: CookingRequest;
  /** 生成されたレシピ */
  recipes: Recipe[];
  /** キャッシュから取得したか */
  cached?: boolean;
}

/**
 * 履歴のソート順
 */
export type HistorySortOrder = "newest" | "oldest";
```

**3. Zustand Store の作成**

`src/shared/store/recipeHistoryStore.ts` を作成:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RecipeHistory, HistorySortOrder } from "@/shared/types/history";
import type { CookingRequest, Recipe } from "@/shared/types/api";

interface RecipeHistoryState {
  // State
  histories: RecipeHistory[];
  sortOrder: HistorySortOrder;

  // Actions
  addHistory: (
    request: CookingRequest,
    recipes: Recipe[],
    cached?: boolean
  ) => void;
  removeHistory: (id: string) => void;
  clearHistories: () => void;
  setSortOrder: (order: HistorySortOrder) => void;
  getHistoryById: (id: string) => RecipeHistory | undefined;
}

/**
 * レシピ履歴を管理するZustandストア
 * localStorageに自動永続化される
 */
export const useRecipeHistoryStore = create<RecipeHistoryState>()(
  persist(
    (set, get) => ({
      histories: [],
      sortOrder: "newest",

      addHistory: (request, recipes, cached = false) => {
        const newHistory: RecipeHistory = {
          id: crypto.randomUUID(), // ユニークID生成
          timestamp: Date.now(),
          request,
          recipes,
          cached,
        };

        set((state) => ({
          histories: [newHistory, ...state.histories],
        }));
      },

      removeHistory: (id) => {
        set((state) => ({
          histories: state.histories.filter((h) => h.id !== id),
        }));
      },

      clearHistories: () => {
        set({ histories: [] });
      },

      setSortOrder: (order) => {
        set({ sortOrder: order });
      },

      getHistoryById: (id) => {
        return get().histories.find((h) => h.id === id);
      },
    }),
    {
      name: "recipe-history-storage", // localStorageのキー名
      storage: createJSONStorage(() => localStorage),
      // 保存するステートを選択(sortOrderは永続化しない例)
      partialize: (state) => ({
        histories: state.histories,
      }),
    }
  )
);

/**
 * ソート済み履歴を取得するセレクタ
 */
export const useSortedHistories = () => {
  const histories = useRecipeHistoryStore((state) => state.histories);
  const sortOrder = useRecipeHistoryStore((state) => state.sortOrder);

  return [...histories].sort((a, b) => {
    return sortOrder === "newest"
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp;
  });
};
```

**4. 既存の useRecipeGenerator フックとの統合**

`src/shared/hooks/useRecipeGenerator.ts` を更新:

```typescript
import { useRecipeHistoryStore } from "@/shared/store/recipeHistoryStore";

export function useRecipeGenerator({
  apiUrl,
}: UseRecipeGeneratorOptions): UseRecipeGeneratorReturn {
  // ... 既存のコード ...
  const addHistory = useRecipeHistoryStore((state) => state.addHistory);

  const generateRecipes = async (
    request: CookingRequest
  ): Promise<CookingResponse | null> => {
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

        // 履歴に保存 ✨
        addHistory(request, data.data, data.cached);

        return data;
      }

      // ... エラー処理 ...
    } catch (err) {
      // ... エラー処理 ...
    } finally {
      setLoading(false);
    }
  };

  // ... 残りのコード ...
}
```

**5. UI 実装**

**a) 履歴ページの作成**

`src/app/history/page.tsx`:

```typescript
"use client";

import {
  useSortedHistories,
  useRecipeHistoryStore,
} from "@/shared/store/recipeHistoryStore";
import { RecipeCard } from "@/shared/components/RecipeCard";
import { Button } from "@/shared/shadcn/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const histories = useSortedHistories();
  const { removeHistory, clearHistories } = useRecipeHistoryStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
            <h1 className="text-3xl font-bold">レシピ履歴</h1>
          </div>

          {histories.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("すべての履歴を削除しますか？")) {
                  clearHistories();
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              すべて削除
            </Button>
          )}
        </div>

        {histories.length === 0 ? (
          <p className="text-center text-muted-foreground">履歴がありません</p>
        ) : (
          <div className="space-y-8">
            {histories.map((history) => (
              <div key={history.id} className="rounded-lg border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(history.timestamp).toLocaleString("ja-JP")}
                    </p>
                    <p className="mt-1 text-sm">
                      リクエスト: {history.request.text || "画像からの生成"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHistory(history.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {history.recipes.map((recipe, index) => (
                    <RecipeCard key={index} recipe={recipe} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**b) ホームページに履歴リンクを追加**

`src/app/(index)/page.tsx` のヘッダー部分:

```typescript
<header className="mb-16 text-center">
  <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
    Dish Go
  </h1>
  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
    冷蔵庫の食材を撮るだけで、レシピを自動生成！
  </p>
  <Link
    href="/history"
    className="mt-4 inline-block text-sm text-primary hover:underline"
  >
    📚 レシピ履歴を見る
  </Link>
</header>
```

**6. データ構造例**

localStorage に保存されるデータ:

```json
{
  "state": {
    "histories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": 1733212800000,
        "request": {
          "text": "トマト、チーズ、バジル",
          "recipeCount": 3,
          "useAllIngredients": true
        },
        "recipes": [
          {
            "title": "カプレーゼ",
            "difficulty": "簡単",
            "cookingTime": 10,
            "ingredients": [
              "トマト 2個",
              "モッツァレラチーズ 100g",
              "バジル 適量"
            ],
            "instructions": [
              "トマトとチーズを薄切りにする",
              "交互に並べる",
              "バジルを飾る"
            ]
          }
        ],
        "cached": false
      }
    ]
  },
  "version": 0
}
```

**7. テスト項目**

- [ ] レシピ生成後に自動的に履歴が保存される
- [ ] 履歴ページで過去の生成結果が表示される
- [ ] 個別の履歴を削除できる
- [ ] すべての履歴を一括削除できる
- [ ] ページリロード後も履歴が保持される
- [ ] localStorage の容量制限に達した場合のエラーハンドリング

**8. パフォーマンス最適化**

- 履歴が 100 件を超えたら古いものから自動削除する機能を追加:

```typescript
addHistory: (request, recipes, cached = false) => {
  const newHistory: RecipeHistory = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    request,
    recipes,
    cached,
  };

  set((state) => {
    const updatedHistories = [newHistory, ...state.histories];
    // 最大100件に制限
    return {
      histories: updatedHistories.slice(0, 100),
    };
  });
},
```

**9. エラーハンドリング**

localStorage が利用できない、または容量が不足している場合のハンドリング:

```typescript
import { persist, createJSONStorage } from "zustand/middleware";

export const useRecipeHistoryStore = create<RecipeHistoryState>()(
  persist(
    // ... store定義 ...
    {
      name: "recipe-history-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("履歴の読み込みに失敗しました:", error);
          // フォールバック処理
        }
      },
    }
  )
);
```

---

#### クラウド DB との同期機能 (将来的な拡張)

**目的**: ログイン状態に応じてローカルストレージとクラウド DB(例: Supabase, Firebase, PostgreSQL)を使い分け、ユーザー体験を向上させる。

##### 実装難易度: ⭐⭐⭐ (中程度 - zustand のアーキテクチャにより比較的容易)

**実装が比較的容易な理由:**

1. **Zustand の柔軟性**: ストレージバックエンドを動的に切り替え可能
2. **抽象化レイヤー**: カスタムストレージインターフェースを定義可能
3. **既存コードの再利用**: UI やビジネスロジックは変更不要
4. **段階的移行**: まずローカルのみ実装 → 後から同期機能追加が可能

##### 設計アプローチ

**1. ストレージアダプターパターン**

```typescript
// src/shared/store/adapters/storageAdapter.ts

/**
 * ストレージアダプターインターフェース
 */
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * ローカルストレージアダプター
 */
class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

/**
 * クラウドDBアダプター (例: Supabase)
 */
class CloudStorageAdapter implements StorageAdapter {
  constructor(private userId: string) {}

  async getItem(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("user_storage")
      .select("value")
      .eq("user_id", this.userId)
      .eq("key", key)
      .single();

    return data?.value || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await supabase.from("user_storage").upsert({
      user_id: this.userId,
      key,
      value,
      updated_at: new Date().toISOString(),
    });
  }

  async removeItem(key: string): Promise<void> {
    await supabase
      .from("user_storage")
      .delete()
      .eq("user_id", this.userId)
      .eq("key", key);
  }
}

/**
 * ハイブリッドアダプター (ローカル + クラウド同期)
 */
class HybridStorageAdapter implements StorageAdapter {
  private localAdapter = new LocalStorageAdapter();
  private cloudAdapter: CloudStorageAdapter | null = null;

  constructor(userId: string | null) {
    if (userId) {
      this.cloudAdapter = new CloudStorageAdapter(userId);
    }
  }

  async getItem(key: string): Promise<string | null> {
    // ログイン中: クラウドから取得 → ローカルにキャッシュ
    if (this.cloudAdapter) {
      const cloudValue = await this.cloudAdapter.getItem(key);
      if (cloudValue) {
        await this.localAdapter.setItem(key, cloudValue);
        return cloudValue;
      }
    }
    // 未ログイン or クラウドにデータなし: ローカルから取得
    return this.localAdapter.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    // 必ずローカルに保存 (オフライン対応)
    await this.localAdapter.setItem(key, value);

    // ログイン中: クラウドにも保存
    if (this.cloudAdapter) {
      try {
        await this.cloudAdapter.setItem(key, value);
      } catch (error) {
        console.error("クラウド同期失敗:", error);
        // 同期キューに追加 (後でリトライ)
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.localAdapter.removeItem(key);
    if (this.cloudAdapter) {
      await this.cloudAdapter.removeItem(key);
    }
  }
}
```

**2. 認証状態対応の Zustand Store**

```typescript
// src/shared/store/recipeHistoryStore.ts (更新版)

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { HybridStorageAdapter } from "./adapters/storageAdapter";

interface RecipeHistoryState {
  histories: RecipeHistory[];
  userId: string | null;

  // Actions
  addHistory: (
    request: CookingRequest,
    recipes: Recipe[],
    cached?: boolean
  ) => void;
  removeHistory: (id: string) => void;
  clearHistories: () => void;
  setUserId: (userId: string | null) => void;
  syncWithCloud: () => Promise<void>;
}

/**
 * カスタムストレージ: 認証状態に応じて動的に切り替え
 */
const createDynamicStorage = (userId: string | null): StateStorage => {
  const adapter = new HybridStorageAdapter(userId);

  return {
    getItem: async (name: string): Promise<string | null> => {
      return adapter.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      await adapter.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      await adapter.removeItem(name);
    },
  };
};

export const useRecipeHistoryStore = create<RecipeHistoryState>()(
  persist(
    (set, get) => ({
      histories: [],
      userId: null,

      addHistory: (request, recipes, cached = false) => {
        const newHistory: RecipeHistory = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          request,
          recipes,
          cached,
        };

        set((state) => ({
          histories: [newHistory, ...state.histories].slice(0, 100),
        }));
      },

      removeHistory: (id) => {
        set((state) => ({
          histories: state.histories.filter((h) => h.id !== id),
        }));
      },

      clearHistories: () => {
        set({ histories: [] });
      },

      setUserId: (userId) => {
        set({ userId });
        // ユーザーIDが変わったらクラウドと同期
        if (userId) {
          get().syncWithCloud();
        }
      },

      syncWithCloud: async () => {
        const userId = get().userId;
        if (!userId) return;

        // クラウドからデータ取得してマージ
        try {
          const cloudData = await fetchCloudHistories(userId);
          const localHistories = get().histories;

          // マージロジック: IDでユニークにして重複排除
          const mergedHistories = mergeHistories(localHistories, cloudData);

          set({ histories: mergedHistories });
        } catch (error) {
          console.error("同期エラー:", error);
        }
      },
    }),
    {
      name: "recipe-history-storage",
      storage: createJSONStorage(
        () => createDynamicStorage(null) // 初期値: 未ログイン
      ),
    }
  )
);
```

**3. 認証統合例 (Next-Auth / Clerk / Supabase Auth)**

```typescript
// src/app/layout.tsx または認証プロバイダー

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react"; // Next-Authの例
import { useRecipeHistoryStore } from "@/shared/store/recipeHistoryStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const setUserId = useRecipeHistoryStore((state) => state.setUserId);

  useEffect(() => {
    // ログイン状態が変わったらストアに反映
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else {
      setUserId(null);
    }
  }, [session, setUserId]);

  return <>{children}</>;
}
```

**4. データベーススキーマ例 (Supabase/PostgreSQL)**

```sql
-- ユーザーストレージテーブル
CREATE TABLE user_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- インデックス
CREATE INDEX idx_user_storage_user_id ON user_storage(user_id);

-- Row Level Security (RLS)
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
  ON user_storage
  FOR ALL
  USING (auth.uid()::text = user_id);
```

##### 実装の段階的アプローチ

**フェーズ 1: ローカルのみ (現在)** ✅

- localStorage + zustand
- 認証なし

**フェーズ 2: 認証基盤の導入**

- Next-Auth / Clerk / Supabase Auth 導入
- ユーザー登録・ログイン機能

**フェーズ 3: クラウド保存 (ログイン時のみ)**

- データベース構築 (Supabase 推奨)
- ログイン時: DB 保存
- 未ログイン時: localStorage 保存

**フェーズ 4: 同期機能**

- ローカル → クラウドの自動同期
- クラウド → ローカルの同期 (複数デバイス対応)
- コンフリクト解決 (最終書き込み優先など)

**フェーズ 5: オフライン対応**

- ServiceWorker によるオフライン検知
- 同期キュー実装
- バックグラウンド同期

##### 推奨技術スタック

| 用途               | 推奨ツール         | 理由                                      |
| ------------------ | ------------------ | ----------------------------------------- |
| **認証**           | Clerk              | 簡単、UI コンポーネント付属、無料枠が広い |
|                    | Next-Auth          | オープンソース、カスタマイズ性高          |
| **データベース**   | Supabase           | PostgreSQL、リアルタイム同期、RLS 対応    |
|                    | Firebase Firestore | リアルタイム、オフライン対応が標準        |
| **同期ライブラリ** | TanStack Query     | キャッシュ管理、リトライ、楽観的更新      |

##### 難易度評価の詳細

**容易な点:**

- ✅ Zustand のストレージ抽象化が優秀
- ✅ UI コードを一切変更する必要がない
- ✅ 段階的に機能追加可能
- ✅ 認証サービス(Clerk 等)が簡単に統合できる

**やや複雑な点:**

- ⚠️ データの同期ロジック (コンフリクト解決)
- ⚠️ オフライン時のキュー管理
- ⚠️ 複数デバイス間の整合性保証
- ⚠️ パフォーマンス最適化 (大量データ時)

##### 最小限の実装例 (Supabase + Clerk)

**必要な追加コード量:** 約 200-300 行

```typescript
// 主な追加ファイル:
// - src/shared/store/adapters/storageAdapter.ts (100行)
// - src/lib/supabase.ts (20行)
// - src/app/providers.tsx (30行)
// - 既存Store更新 (50行)
```

**追加依存関係:**

```bash
pnpm add @clerk/nextjs @supabase/supabase-js @tanstack/react-query
```

##### 結論

**実装難易度: 比較的容易** ✅

理由:

1. Zustand のアーキテクチャが同期機能を想定した設計
2. 認証・DB サービス(Clerk, Supabase)が充実している
3. ストレージアダプターパターンで既存コードの変更が最小限
4. 段階的に実装できるため、リスクが低い

**推奨実装順序:**

1. ローカル履歴機能を完成させる (現在のタスク)
2. 認証機能を追加 (Clerk 推奨)
3. Supabase でクラウド保存を実装
4. 同期ロジックを追加
5. オフライン対応を実装 (オプション)

各フェーズは独立しているため、必要に応じて実装を中断・再開できます。

---

## スクリプト

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番サーバー起動
pnpm start

# コードチェック
pnpm lint

# コード自動修正
pnpm lint:fix

# コードフォーマット
pnpm format
```

## 環境変数

`.env.local` ファイルを作成:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 技術スタック詳細

- **Next.js 16**: React Server Components、App Router
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファースト CSS
- **shadcn/ui**: 高品質な UI コンポーネント
- **React Hook Form**: フォーム管理
- **Zod**: スキーマバリデーション
- **Sonner**: トースト通知
- **Biome**: 高速なリンター・フォーマッター
- **Zustand** (予定): 軽量状態管理ライブラリ

## 参考リンク

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## ライセンス

Private
