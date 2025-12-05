"use client";

import { useState } from "react";
import { Menu, History, LogIn, Languages } from "lucide-react";
import { Button } from "@/shared/shadcn/components/ui/button";
import { ScrollArea } from "@/shared/shadcn/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/shadcn/components/ui/sheet";
import { cn } from "@/shared/shadcn/lib/utils";
import { LoginModal } from "./LoginModal";
import { Heading } from "./Heading";

// ダミーの履歴データ
const DUMMY_HISTORY = [
  { id: 1, title: "カレーライス", date: "2025-12-02" },
  { id: 2, title: "親子丼", date: "2025-12-01" },
  { id: 3, title: "焼き魚定食", date: "2025-11-30" },
  { id: 4, title: "パスタカルボナーラ", date: "2025-11-29" },
  { id: 5, title: "豚の生姜焼き", date: "2025-11-28" },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* モバイル用ハンバーガーメニュー */}
      <div className={cn("lg:hidden", className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                Dish Go
              </SheetTitle>
            </SheetHeader>
            <NavigationContent onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* PC用サイドバー */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-80 border-r bg-background h-screen sticky top-0",
          className
        )}
      >
        <div className="p-6 border-b">
          <div className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">Dish Go</div>
        </div>
        <NavigationContent />
      </aside>
    </>
  );
}

interface NavigationContentProps {
  onItemClick?: () => void;
}

function NavigationContent({ onItemClick }: NavigationContentProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    onItemClick?.();
  };

  const handleLanguageChange = () => {
    // TODO: 言語変更機能の実装
    console.log("言語変更機能は未実装です");
    onItemClick?.();
  };

  const handleHistoryClick = (recipeId: number) => {
    // TODO: 履歴詳細表示機能の実装
    console.log(`レシピID ${recipeId} をクリックしました`);
    onItemClick?.();
  };

  return (
    <>
      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <div className="flex flex-col h-full">
        {/* アクションボタン */}
        <div className="p-4 space-y-2 border-b">
          <Button variant="default" className="w-full justify-start" onClick={handleLogin}>
            <LogIn className="mr-2 h-4 w-4" />
            ログイン / 登録
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={handleLanguageChange}>
            <Languages className="mr-2 h-4 w-4" />
            言語: 日本語
          </Button>
        </div>

        {/* 履歴セクション */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 flex items-center gap-2 border-b">
            <History className="h-5 w-5" />
            <Heading level="h2">レシピ履歴</Heading>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {DUMMY_HISTORY.length > 0 ? (
                DUMMY_HISTORY.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleHistoryClick(recipe.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                    type="button"
                  >
                    <div className="font-medium">{recipe.title}</div>
                    <div className="text-sm text-muted-foreground">{recipe.date}</div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  まだ履歴がありません
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
