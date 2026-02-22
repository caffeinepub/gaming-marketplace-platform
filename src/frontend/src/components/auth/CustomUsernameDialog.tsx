import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetPaymentDetails, useSubmitCustomUsername, useCreateUsername } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, CreditCard, Gift, Coins, Upload, Check } from 'lucide-react';
import { GiftCardType, PaymentMethod } from '../../backend';
import { ExternalBlob } from '../../backend';
import PaymentMethodCard from '../checkout/PaymentMethodCard';

interface CustomUsernameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UK_GIFT_CARD_OPTIONS = [
  { value: GiftCardType.amazon, label: 'Amazon UK' },
  { value: GiftCardType.tesco, label: 'Tesco UK' },
  { value: GiftCardType.starbucks, label: 'Starbucks UK' },
  { value: GiftCardType.other, label: 'Other UK Gift Card' },
];

const HARDCODED_CRYPTO_ADDRESS = 'bc1q9jqngrwkpay42hvdmcl2lnyh3y4fx7l7ufh722';

type Step = 'payment-method' | 'payment-proof' | 'username-input';

export default function CustomUsernameDialog({ open, onOpenChange, onSuccess }: CustomUsernameDialogProps) {
  const { data: paymentDetails, isLoading: paymentLoading } = useGetPaymentDetails();
  const submitCustomUsername = useSubmitCustomUsername();
  const createUsername = useCreateUsername();

  const [step, setStep] = useState<Step>('payment-method');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'giftcard' | 'crypto'>('paypal');
  
  // Payment proof fields
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [giftCardType, setGiftCardType] = useState<GiftCardType | ''>('');
  const [giftCardCode, setGiftCardCode] = useState('');

  // Username input fields
  const [customUsername, setCustomUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const price = paymentDetails?.customUsernamePriceGBP || 0.10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setScreenshotFile(file);
    }
  };

  const validateUsername = (username: string): boolean => {
    setUsernameError('');

    if (username.length < 5) {
      setUsernameError('Username must be at least 5 characters long');
      return false;
    }

    const alphanumericRegex = /^[a-z0-9]+$/;
    if (!alphanumericRegex.test(username.toLowerCase())) {
      setUsernameError('Username must only contain letters and numbers');
      return false;
    }

    return true;
  };

  const handlePaymentProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    if (selectedPaymentMethod === 'giftcard') {
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
      let paymentMethodEnum: PaymentMethod;
      let transactionDetails = '';

      if (selectedPaymentMethod === 'paypal') {
        paymentMethodEnum = PaymentMethod.paypal;
        
        // Upload screenshot
        const bytes = new Uint8Array(await screenshotFile!.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        const screenshotUrl = blob.getDirectURL();
        transactionDetails = `Transaction ID: ${transactionId.trim()}, Screenshot: ${screenshotUrl}`;
      } else if (selectedPaymentMethod === 'crypto') {
        paymentMethodEnum = PaymentMethod.crypto;
        
        // Upload screenshot
        const bytes = new Uint8Array(await screenshotFile!.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        const screenshotUrl = blob.getDirectURL();
        transactionDetails = `Transaction ID: ${transactionId.trim()}, Screenshot: ${screenshotUrl}`;
      } else {
        paymentMethodEnum = PaymentMethod.giftCard;
        transactionDetails = `Gift Card Type: ${giftCardType}, Code: ${giftCardCode.trim()}, Transaction ID: ${transactionId.trim()}`;
      }

      // Move to username input step (don't submit yet)
      setStep('username-input');
      toast.success('Payment details recorded! Now choose your username.');
    } catch (error: any) {
      console.error('Payment proof error:', error);
      toast.error(error.message || 'Failed to process payment proof');
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = customUsername.trim().toLowerCase();
    
    if (!validateUsername(username)) {
      return;
    }

    try {
      // Prepare transaction details
      let paymentMethodEnum: PaymentMethod;
      let transactionDetails = '';

      if (selectedPaymentMethod === 'paypal') {
        paymentMethodEnum = PaymentMethod.paypal;
        const bytes = new Uint8Array(await screenshotFile!.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        const screenshotUrl = blob.getDirectURL();
        transactionDetails = `Transaction ID: ${transactionId.trim()}, Screenshot: ${screenshotUrl}`;
      } else if (selectedPaymentMethod === 'crypto') {
        paymentMethodEnum = PaymentMethod.crypto;
        const bytes = new Uint8Array(await screenshotFile!.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        const screenshotUrl = blob.getDirectURL();
        transactionDetails = `Transaction ID: ${transactionId.trim()}, Screenshot: ${screenshotUrl}`;
      } else {
        paymentMethodEnum = PaymentMethod.giftCard;
        transactionDetails = `Gift Card Type: ${giftCardType}, Code: ${giftCardCode.trim()}, Transaction ID: ${transactionId.trim()}`;
      }

      // Submit custom username request
      await submitCustomUsername.mutateAsync({
        requestedUsername: username,
        paymentMethod: paymentMethodEnum,
        transactionDetails,
      });

      toast.success('Custom username submitted for admin approval!');
      onSuccess();
    } catch (error: any) {
      console.error('Username submission error:', error);
      
      if (error.message?.includes('already taken') || error.message?.includes('bombsawayYYYYYY')) {
        setUsernameError('This username is already taken. Please try another.');
      } else if (error.message?.includes('forbidden')) {
        setUsernameError('This username contains inappropriate content. Please choose another.');
      } else {
        toast.error(error.message || 'Failed to submit custom username');
      }
    }
  };

  if (paymentLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Your Own Username</DialogTitle>
          <DialogDescription>
            Pay £{price.toFixed(2)} to choose your own custom username
          </DialogDescription>
        </DialogHeader>

        {step === 'payment-method' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Step 1: Select Payment Method</h3>
              
              <div className="grid gap-4">
                <button
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedPaymentMethod === 'paypal'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">PayPal</p>
                      <p className="text-sm text-muted-foreground">Pay with PayPal</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod('giftcard')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedPaymentMethod === 'giftcard'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">UK Gift Card</p>
                      <p className="text-sm text-muted-foreground">Amazon, Tesco, Starbucks, etc.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod('crypto')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedPaymentMethod === 'crypto'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Cryptocurrency</p>
                      <p className="text-sm text-muted-foreground">Bitcoin</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Payment Details</h3>
              
              {selectedPaymentMethod === 'paypal' && paymentDetails?.paypalEmail && (
                <PaymentMethodCard
                  title="PayPal"
                  description={`Send £${price.toFixed(2)} to this PayPal email`}
                  details={paymentDetails.paypalEmail}
                  icon={<CreditCard className="h-5 w-5 text-primary" />}
                />
              )}

              {selectedPaymentMethod === 'giftcard' && paymentDetails?.ukGiftCardInstructions && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>UK Gift Cards</CardTitle>
                        <CardDescription>Instructions for gift card payment</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{paymentDetails.ukGiftCardInstructions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedPaymentMethod === 'crypto' && (
                <PaymentMethodCard
                  title="Bitcoin"
                  description={`Send £${price.toFixed(2)} worth of Bitcoin to this address`}
                  details={HARDCODED_CRYPTO_ADDRESS}
                  icon={<Coins className="h-5 w-5 text-primary" />}
                />
              )}
            </div>

            <Button onClick={() => setStep('payment-proof')} className="w-full">
              Continue to Payment Proof
            </Button>
          </div>
        )}

        {step === 'payment-proof' && (
          <div className="space-y-6 py-4">
            <h3 className="font-semibold">Step 2: Submit Payment Proof</h3>
            
            <form onSubmit={handlePaymentProofSubmit} className="space-y-4">
              {selectedPaymentMethod === 'giftcard' && (
                <>
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

                  <div className="space-y-2">
                    <Label htmlFor="giftCardCode">Gift Card Code *</Label>
                    <Input
                      id="giftCardCode"
                      type="text"
                      placeholder="Enter your gift card code"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      required
                    />
                  </div>
                </>
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
                />
              </div>

              {selectedPaymentMethod !== 'giftcard' && (
                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment Screenshot *</Label>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="cursor-pointer"
                  />
                  {screenshotFile && (
                    <p className="text-sm text-muted-foreground">
                      {screenshotFile.name}
                    </p>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('payment-method')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue to Username
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'username-input' && (
          <div className="space-y-6 py-4">
            <h3 className="font-semibold">Step 3: Choose Your Username</h3>
            
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customUsername">Custom Username *</Label>
                <Input
                  id="customUsername"
                  type="text"
                  placeholder="Enter your desired username"
                  value={customUsername}
                  onChange={(e) => {
                    setCustomUsername(e.target.value);
                    setUsernameError('');
                  }}
                  required
                  disabled={submitCustomUsername.isPending}
                />
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Must be at least 5 characters, alphanumeric only
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('payment-proof')}
                  className="flex-1"
                  disabled={submitCustomUsername.isPending}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitCustomUsername.isPending || !customUsername.trim()}
                >
                  {submitCustomUsername.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit Username
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
