import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitQueueSkipPayment } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { GiftCardType } from '../../backend';

interface QueueSkipPaymentFormProps {
  onSuccess: () => void;
}

type PaymentMethod = 'paypal' | 'giftcard' | 'crypto';

const UK_GIFT_CARD_OPTIONS = [
  { value: GiftCardType.amazon, label: 'Amazon UK' },
  { value: GiftCardType.tesco, label: 'Tesco UK' },
  { value: GiftCardType.starbucks, label: 'Starbucks UK' },
  { value: GiftCardType.other, label: 'Other UK Gift Card' },
];

export default function QueueSkipPaymentForm({ onSuccess }: QueueSkipPaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [giftCardType, setGiftCardType] = useState<GiftCardType | ''>('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const submitPayment = useSubmitQueueSkipPayment();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setScreenshotFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    // Validate based on payment method
    if (paymentMethod === 'giftcard') {
      if (!giftCardType) {
        toast.error('Please select a gift card type');
        return;
      }
      if (!giftCardCode.trim()) {
        toast.error('Please enter the gift card code');
        return;
      }
    } else {
      if (!screenshotFile) {
        toast.error('Please upload a payment screenshot');
        return;
      }
    }

    try {
      // Determine the gift card type to send
      let finalGiftCardType: GiftCardType;
      if (paymentMethod === 'giftcard') {
        finalGiftCardType = giftCardType as GiftCardType;
      } else if (paymentMethod === 'crypto') {
        finalGiftCardType = GiftCardType.cryptocurrency;
      } else {
        finalGiftCardType = GiftCardType.other;
      }

      await submitPayment.mutateAsync({
        transactionId: transactionId.trim(),
        giftCardType: finalGiftCardType,
        giftCardCode: paymentMethod === 'giftcard' ? giftCardCode.trim() : null,
      });

      toast.success('Payment submitted! You can now access the platform.');
      setTransactionId('');
      setScreenshotFile(null);
      setGiftCardType('');
      setGiftCardCode('');
      setUploadProgress(0);
      onSuccess();
    } catch (error: any) {
      console.error('Payment submission error:', error);
      toast.error(error.message || 'Failed to submit payment proof');
    }
  };

  const isGiftCardMethod = paymentMethod === 'giftcard';
  const requiresScreenshot = !isGiftCardMethod;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Payment Proof</CardTitle>
        <CardDescription>
          {isGiftCardMethod
            ? 'Select your UK gift card type and enter the gift card code to bypass the queue instantly.'
            : 'Upload your payment screenshot and transaction ID to bypass the queue instantly.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="giftcard">UK Gift Card</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gift Card Type Selection (only for gift card method) */}
          {isGiftCardMethod && (
            <div className="space-y-2">
              <Label htmlFor="giftCardType">Gift Card Type *</Label>
              <Select value={giftCardType} onValueChange={(value) => setGiftCardType(value as GiftCardType)}>
                <SelectTrigger id="giftCardType">
                  <SelectValue placeholder="Select UK gift card type" />
                </SelectTrigger>
                <SelectContent>
                  {UK_GIFT_CARD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Gift Card Code Input (only for gift card method) */}
          {isGiftCardMethod && (
            <div className="space-y-2">
              <Label htmlFor="giftCardCode">Gift Card Code *</Label>
              <Input
                id="giftCardCode"
                type="text"
                placeholder="Enter your gift card code"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                required
                disabled={submitPayment.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full gift card code exactly as it appears on your card
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID *</Label>
            <Input
              id="transactionId"
              type="text"
              placeholder="Enter your transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              disabled={submitPayment.isPending}
            />
          </div>

          {/* Screenshot Upload (only for PayPal and Crypto) */}
          {requiresScreenshot && (
            <div className="space-y-2">
              <Label htmlFor="screenshot">Payment Screenshot *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  disabled={submitPayment.isPending}
                  className="cursor-pointer"
                />
                {screenshotFile && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {screenshotFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a clear screenshot of your payment confirmation (max 5MB)
              </p>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              submitPayment.isPending ||
              !transactionId.trim() ||
              (isGiftCardMethod ? !giftCardType || !giftCardCode.trim() : !screenshotFile)
            }
          >
            {submitPayment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Payment Proof
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
