import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCart, useGetAllProducts, useGetPaymentDetails, useClearCart } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PaymentMethodCard from '../components/checkout/PaymentMethodCard';
import { CreditCard, Gift, Coins, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: cart = [] } = useGetCart();
  const { data: products = [] } = useGetAllProducts();
  const { data: paymentDetails } = useGetPaymentDetails();
  const clearCart = useClearCart();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item) => item !== null);

  const total = cartItems.reduce((sum, item) => {
    return sum + item!.product.priceGBP * Number(item!.quantity);
  }, 0);

  const handleCompleteOrder = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Order placed! Please complete payment using the instructions above.');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-12">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Button onClick={() => navigate({ to: '/' })}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Review your order and complete payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item!.productId} className="flex gap-4">
                    <img
                      src={item!.product.image.getDirectURL()}
                      alt={item!.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item!.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {Number(item!.quantity)} × £{item!.product.priceGBP.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">£{(item!.product.priceGBP * Number(item!.quantity)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">£{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Payment Methods</h2>
            <p className="text-muted-foreground">
              Choose a payment method and follow the instructions to complete your purchase.
            </p>

            <div className="space-y-4">
              <PaymentMethodCard
                title="PayPal"
                description="Send payment to our PayPal account"
                details={paymentDetails?.paypalEmail || ''}
                icon={<CreditCard className="h-6 w-6 text-primary" />}
              />

              <PaymentMethodCard
                title="UK Gift Cards"
                description="Payment via UK gift cards"
                details={paymentDetails?.ukGiftCardInstructions || ''}
                icon={<Gift className="h-6 w-6 text-primary" />}
              />

              <PaymentMethodCard
                title="Cryptocurrency"
                description="Send crypto to our wallet address"
                details={paymentDetails?.cryptoWalletAddress || ''}
                icon={<Coins className="h-6 w-6 text-primary" />}
              />
            </div>

            <Button onClick={handleCompleteOrder} className="w-full" size="lg" disabled={clearCart.isPending}>
              Complete Order
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              After completing payment, your order will be processed manually by our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
