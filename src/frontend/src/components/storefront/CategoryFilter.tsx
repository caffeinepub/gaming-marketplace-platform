import { Category } from '../../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  productCounts: Record<string, number>;
}

const categoryIcons: Record<string, string> = {
  account: '/assets/generated/account-icon.dim_128x128.png',
  currency: '/assets/generated/currency-icon.dim_128x128.png',
  clothes: '/assets/generated/clothes-icon.dim_128x128.png',
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onSelectCategory(null)}
        className="gap-2"
      >
        All Products
        <Badge variant="secondary">{Object.values(productCounts).reduce((a, b) => a + b, 0)}</Badge>
      </Button>
      {categories.map((category) => {
        const icon = categoryIcons[category.name.toLowerCase()] || categoryIcons.account;
        const count = productCounts[category.name] || 0;

        return (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            onClick={() => onSelectCategory(category.name)}
            className="gap-2"
          >
            <img src={icon} alt={category.name} className="h-5 w-5" />
            {category.name}
            <Badge variant="secondary">{count}</Badge>
          </Button>
        );
      })}
    </div>
  );
}
