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
  const [instagramUrl, setInstagramUrl] = useState('');
  const [queueSkipPriceGBP, setQueueSkipPriceGBP] = useState('0.05');
  const [usernameRegenerationPriceGBP, setUsernameRegenerationPriceGBP] = useState('0.01');
  const [instagramUrlError, setInstagramUrlError] = useState('');

  useEffect(() => {
    if (paymentDetails) {
      setPaypalEmail(paymentDetails.paypalEmail);
      setUkGiftCardInstructions(paymentDetails.ukGiftCardInstructions);
      setCryptoWalletAddress(paymentDetails.cryptoWalletAddress);
      setInstagramUrl(paymentDetails.instagramUrl);
      setQueueSkipPriceGBP(paymentDetails.queueSkipPriceGBP.toString());
      setUsernameRegenerationPriceGBP(paymentDetails.usernameRegenerationPriceGBP.toString());
    }
  }, [paymentDetails]);

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInstagramUrlChange = (value: string) => {
    setInstagramUrl(value);
    if (value && !validateUrl(value)) {
      setInstagramUrlError('Please enter a valid URL');
    } else {
      setInstagramUrlError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (instagramUrl && !validateUrl(instagramUrl)) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }

    const queueSkipPrice = parseFloat(queueSkipPriceGBP);
    if (isNaN(queueSkipPrice) || queueSkipPrice <= 0) {
      toast.error('Queue skip price must be a positive number');
      return;
    }

    const usernameChangePrice = parseFloat(usernameRegenerationPriceGBP);
    if (isNaN(usernameChangePrice) || usernameChangePrice <= 0) {
      toast.error('Username change price must be a positive number');
      return;
    }

    try {
      await updatePaymentDetails.mutateAsync({
        paypalEmail,
        ukGiftCardInstructions,
        cryptoWalletAddress,
        instagramUrl,
        queueSkipPriceGBP: queueSkipPrice,
        usernameRegenerationPriceGBP: usernameChangePrice,
      });
      toast.success('Payment details updated successfully');
    } catch (error: any) {
      console.error('Update payment details error:', error);
      toast.error(error.message || 'Failed to update payment details');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Configuration</CardTitle>
        <CardDescription>Configure payment methods and pricing for your marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input
              id="paypalEmail"
              type="email"
              placeholder="your-email@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ukGiftCardInstructions">UK Gift Card Instructions</Label>
            <Textarea
              id="ukGiftCardInstructions"
              placeholder="Enter instructions for UK gift card redemption..."
              value={ukGiftCardInstructions}
              onChange={(e) => setUkGiftCardInstructions(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cryptoWalletAddress">Cryptocurrency Wallet Address</Label>
            <Input
              id="cryptoWalletAddress"
              type="text"
              placeholder="0x..."
              value={cryptoWalletAddress}
              onChange={(e) => setCryptoWalletAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input
              id="instagramUrl"
              type="url"
              placeholder="https://instagram.com/yourprofile"
              value={instagramUrl}
              onChange={(e) => handleInstagramUrlChange(e.target.value)}
            />
            {instagramUrlError && (
              <p className="text-sm text-destructive">{instagramUrlError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="queueSkipPriceGBP">Queue Skip Price (£)</Label>
            <Input
              id="queueSkipPriceGBP"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.05"
              value={queueSkipPriceGBP}
              onChange={(e) => setQueueSkipPriceGBP(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Price users pay to skip the login queue
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usernameRegenerationPriceGBP">Username Change Price (£)</Label>
            <Input
              id="usernameRegenerationPriceGBP"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.01"
              value={usernameRegenerationPriceGBP}
              onChange={(e) => setUsernameRegenerationPriceGBP(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Price users pay to regenerate their username
            </p>
          </div>

          <Button type="submit" disabled={updatePaymentDetails.isPending || !!instagramUrlError}>
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
