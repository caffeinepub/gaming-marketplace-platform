import { Product } from '../../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAddToCart } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const addToCart = useAddToCart();

  const isOutOfStock = Number(product.quantityAvailable) === 0;
  const imageUrl = product.image.getDirectURL();

  const getProductTypeBadge = () => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      account: 'default',
      currency: 'secondary',
      clothes: 'outline',
    };
    return variants[product.productType] || 'default';
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${isOutOfStock ? 'opacity-60' : ''}`}>
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <Badge variant={getProductTypeBadge()}>{product.productType}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">£{product.priceGBP.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">{Number(product.quantityAvailable)} available</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || addToCart.isPending || !isAuthenticated}
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAuthenticated ? 'Add to Cart' : 'Login to Purchase'}
        </Button>
      </CardFooter>
    </Card>
  );
}
