import { useState, useEffect } from 'react';
import { useGetPaymentDetails, useUpdatePaymentDetails } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentConfigForm() {
  const { data: paymentDetails } = useGetPaymentDetails();
  const updatePaymentDetails = useUpdatePaymentDetails();

  const [paypalEmail, setPaypalEmail] = useState('');
  const [ukGiftCardInstructions, setUkGiftCardInstructions] = useState('');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');

  useEffect(() => {
    if (paymentDetails) {
      setPaypalEmail(paymentDetails.paypalEmail);
      setUkGiftCardInstructions(paymentDetails.ukGiftCardInstructions);
      setCryptoWalletAddress(paymentDetails.cryptoWalletAddress);
    }
  }, [paymentDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePaymentDetails.mutateAsync({
        paypalEmail,
        ukGiftCardInstructions,
        cryptoWalletAddress,
      });
      toast.success('Payment details updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment details');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Configuration</CardTitle>
        <CardDescription>Configure payment methods for buyers to complete their purchases.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="paypal">PayPal Email</Label>
            <Input
              id="paypal"
              type="email"
              placeholder="your-paypal@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="giftcard">UK Gift Card Instructions</Label>
            <Textarea
              id="giftcard"
              placeholder="Enter instructions for UK gift card payments..."
              value={ukGiftCardInstructions}
              onChange={(e) => setUkGiftCardInstructions(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crypto">Crypto Wallet Address</Label>
            <Input
              id="crypto"
              placeholder="0x..."
              value={cryptoWalletAddress}
              onChange={(e) => setCryptoWalletAddress(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={updatePaymentDetails.isPending}>
            {updatePaymentDetails.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Details'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
