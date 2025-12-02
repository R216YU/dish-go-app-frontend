import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/shadcn/components/ui/accordion";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/components/ui/card";
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

  return (
    <Card ref={cardRef} className="transition-shadow duration-200 hover:shadow-lg">
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
                <h3 className="text-xl font-semibold leading-tight">{recipe.title}</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {recipe.difficulty}
                  </Badge>
                  <span className="text-base leading-snug text-muted-foreground">
                    {recipe.cookingTime}分
                  </span>
                </div>
              </div>
            </AccordionTrigger>
          </CardHeader>

          <AccordionContent>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h4 className="mb-3 text-base font-semibold leading-snug">材料</h4>
                <ul className="list-inside list-disc space-y-2 text-base leading-relaxed text-muted-foreground">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-3 text-base font-semibold leading-snug">作り方</h4>
                <ol className="space-y-3 text-base leading-relaxed text-muted-foreground">
                  {recipe.instructions.map((instruction) => {
                    const match = instruction.match(/^(\d+)\.\s*(.*)$/);
                    const number = match ? match[1] : "";
                    const text = match ? match[2] : instruction;
                    return (
                      <li key={instruction} className="flex gap-2">
                        <span className="font-semibold text-primary">{number}.</span>
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
