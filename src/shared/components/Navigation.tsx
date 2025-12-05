"use client";

import { History, Languages, LogIn, Menu } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Heading } from "./Heading";
import { LoginModal } from "./LoginModal";

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />

      {/* モバイル用ヘッダー */}
      <header
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-background",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* 左側: サイトロゴ */}
          <div className="text-lg font-bold text-primary">Dish Go</div>

          {/* 右側: ログインボタンとハンバーガーメニュー */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden sm:flex"
            >
              <LogIn className="mr-2 h-4 w-4" />
              ログイン
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLoginModalOpen(true)}
              className="sm:hidden"
            >
              <LogIn className="h-5 w-5" />
              <span className="sr-only">ログイン</span>
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
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
        </div>
      </header>

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
    <div className="flex flex-col h-full">
      {/* アクションボタン */}
      <div className="p-4 space-y-2 border-b">
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
              <p className="text-sm text-muted-foreground text-center py-8">まだ履歴がありません</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
