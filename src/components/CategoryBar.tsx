import { categories } from "@/data/products";
import { Button } from "@/components/ui/button";

interface CategoryBarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryBar({ selectedCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className="w-full overflow-x-auto py-4 scrollbar-hide">
      <div className="flex gap-2 min-w-max px-4 md:px-0 md:justify-center">
        <Button
          variant={selectedCategory === null ? "default" : "secondary"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="rounded-full"
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "secondary"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="rounded-full"
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
