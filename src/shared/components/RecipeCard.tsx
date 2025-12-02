import type { Recipe } from "@/shared/types/api";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {recipe.title}
      </h3>
      <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="rounded-full bg-green-100 px-3 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
          {recipe.difficulty}
        </span>
        <span>🕐 {recipe.cookingTime}分</span>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
          材料
        </h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
          作り方
        </h4>
        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {recipe.instructions.map((instruction) => {
            const match = instruction.match(/^(\d+)\.\s*(.*)$/);
            const number = match ? match[1] : "";
            const text = match ? match[2] : instruction;
            return (
              <li key={instruction} className="flex gap-2">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {number}.
                </span>
                <span>{text}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
