import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/shadcn/components/ui/accordion";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/shadcn/components/ui/card";
import type { Recipe } from "@/shared/types/api";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (value: string) => {
    if (value && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  };

  // 難易度に応じた色を取得
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "簡単":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300";
      case "普通":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      case "難しい":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card
      ref={cardRef}
      className="transition-shadow duration-200 hover:shadow-lg"
    >
      <Accordion
        type="single"
        collapsible
        className="w-full min-h-[130px]"
        onValueChange={handleValueChange}
      >
        <AccordionItem value="recipe-details" className="border-none">
          <CardHeader className="space-y-3 pb-0">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full flex-col items-start gap-3 text-left">
                <h3 className="text-sm font-semibold leading-tight sm:text-base md:text-lg">
                  {recipe.title}
                </h3>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={`text-xs sm:text-xs md:text-sm ${getDifficultyColor(
                      recipe.difficulty
                    )}`}
                  >
                    {recipe.difficulty}
                  </Badge>
                  <span className="text-xs leading-snug text-muted-foreground sm:text-sm md:text-base">
                    {recipe.cookingTime}分
                  </span>
                </div>
              </div>
            </AccordionTrigger>
          </CardHeader>

          <AccordionContent>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h4 className="mb-3 text-xs font-semibold leading-snug sm:text-sm md:text-base">
                  材料
                </h4>
                <ul className="list-inside list-disc space-y-2 text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-semibold leading-snug sm:text-sm md:text-base">
                  作り方
                </h4>
                <ol className="space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
                  {recipe.instructions.map((instruction) => {
                    const match = instruction.match(/^(\d+)\.\s*(.*)$/);
                    const number = match ? match[1] : "";
                    const text = match ? match[2] : instruction;
                    return (
                      <li key={instruction} className="flex gap-2">
                        <span className="font-semibold text-primary">
                          {number}.
                        </span>
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
