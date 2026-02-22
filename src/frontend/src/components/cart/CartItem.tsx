import { useGetAllProducts, useUpdateCartItemQuantity } from '../../hooks/useQueries';
import { CartItem as CartItemType } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { data: products = [] } = useGetAllProducts();
  const updateQuantity = useUpdateCartItemQuantity();
  const [quantity, setQuantity] = useState(Number(item.quantity));

  const product = products.find((p) => p.id === item.productId);

  if (!product) return null;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    try {
      await updateQuantity.mutateAsync({ productId: item.productId, quantity: BigInt(newQuantity) });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setQuantity(Number(item.quantity));
    }
  };

  const handleRemove = () => handleQuantityChange(0);

  const subtotal = product.priceGBP * quantity;
  const imageUrl = product.image.getDirectURL();

  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg">
      <img src={imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{product.name}</h4>
        <p className="text-sm text-muted-foreground">£{product.priceGBP.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={updateQuantity.isPending}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setQuantity(val);
            }}
            onBlur={() => handleQuantityChange(quantity)}
            className="h-7 w-16 text-center"
            min="0"
            max={Number(product.quantityAvailable)}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={updateQuantity.isPending || quantity >= Number(product.quantityAvailable)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto text-destructive"
            onClick={handleRemove}
            disabled={updateQuantity.isPending}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">£{subtotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
