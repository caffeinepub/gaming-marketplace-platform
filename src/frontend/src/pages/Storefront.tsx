import { useState, useMemo } from 'react';
import { useGetAllProducts, useGetAllCategories, useGetInstagramUrl } from '../hooks/useQueries';
import ProductCard from '../components/storefront/ProductCard';
import CategoryFilter from '../components/storefront/CategoryFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { Youtube, Instagram } from 'lucide-react';

export default function Storefront() {
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategories();
  const { data: instagramUrl = '' } = useGetInstagramUrl();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.gameCategory === selectedCategory);
  }, [products, selectedCategory]);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      counts[product.gameCategory] = (counts[product.gameCategory] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-[400px] overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="GameVault Marketplace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Welcome to GameVault
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Your trusted marketplace for premium gaming accounts, in-game currency, and exclusive items
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 space-y-8">
        {/* Category Filter */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          {categoriesLoading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>
          ) : (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              productCounts={productCounts}
            />
          )}
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
          </h2>
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-[400px]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {selectedCategory ? 'No products found in this category.' : 'No products available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Social Media Links */}
        <div className="flex items-center justify-center gap-6 pt-8 pb-4 border-t border-border">
          <a
            href="https://youtube.com/@fros7yyt?si=u4-j8LrTkNuj7wUo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-border hover:border-primary group"
          >
            <Youtube className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">YouTube</span>
          </a>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-border hover:border-accent group"
            >
              <Instagram className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Instagram</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
