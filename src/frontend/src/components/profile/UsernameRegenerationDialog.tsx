import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetPaymentDetails, useGetCallerUserProfile } from '../../hooks/useQueries';
import { CreditCard, Gift, Coins, RefreshCw } from 'lucide-react';
import PaymentMethodCard from '../checkout/PaymentMethodCard';
import UsernameRegenerationPaymentForm from './UsernameRegenerationPaymentForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import CustomUsernameDialog from '../auth/CustomUsernameDialog';

interface UsernameRegenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HARDCODED_CRYPTO_ADDRESS = 'bc1q9jqngrwkpay42hvdmcl2lnyh3y4fx7l7ufh722';

export default function UsernameRegenerationDialog({ open, onOpenChange }: UsernameRegenerationDialogProps) {
  const { data: paymentDetails, isLoading } = useGetPaymentDetails();
  const { data: userProfile } = useGetCallerUserProfile();
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  if (isLoading) {
    return null;
  }

  const regenerationPrice = paymentDetails?.usernameRegenerationPriceGBP || 0.01;
  const customPrice = paymentDetails?.customUsernamePriceGBP || 0.10;

  const handleCustomSuccess = () => {
    setShowCustomDialog(false);
    onOpenChange(false);
  };

  if (showCustomDialog) {
    return <CustomUsernameDialog open={true} onOpenChange={setShowCustomDialog} onSuccess={handleCustomSuccess} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Change Your Username</DialogTitle>
          <DialogDescription>
            Current username: <span className="font-semibold text-foreground">{userProfile?.username || 'N/A'}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 py-4">
            {/* AI Regeneration Option */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Generated Username (£{regenerationPrice.toFixed(2)})</h3>
              </div>
              
              <Alert className="border-primary/20 bg-primary/5">
                <AlertDescription>
                  Get a new AI-generated GamerTag-style username for just £{regenerationPrice.toFixed(2)}
                </AlertDescription>
              </Alert>

              {/* Payment Methods for Regeneration */}
              <div className="grid gap-4">
                {paymentDetails?.paypalEmail && (
                  <PaymentMethodCard
                    title="PayPal"
                    description={`Send £${regenerationPrice.toFixed(2)} to this PayPal email`}
                    details={paymentDetails.paypalEmail}
                    icon={<CreditCard className="h-5 w-5 text-primary" />}
                  />
                )}

                {paymentDetails?.ukGiftCardInstructions && (
                  <PaymentMethodCard
                    title="UK Gift Cards"
                    description="Use Amazon, Tesco, Starbucks, or other UK gift cards"
                    details={paymentDetails.ukGiftCardInstructions}
                    icon={<Gift className="h-5 w-5 text-primary" />}
                  />
                )}

                <PaymentMethodCard
                  title="Cryptocurrency"
                  description={`Send £${regenerationPrice.toFixed(2)} worth of Bitcoin to this address`}
                  details={HARDCODED_CRYPTO_ADDRESS}
                  icon={<Coins className="h-5 w-5 text-primary" />}
                />
              </div>

              {/* Payment Form for Regeneration */}
              <UsernameRegenerationPaymentForm onSuccess={() => onOpenChange(false)} />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Custom Username Option */}
            <div className="space-y-4">
              <h3 className="font-semibold">Make Your Own Username (£{customPrice.toFixed(2)})</h3>
              
              <Alert className="border-primary/20 bg-primary/5">
                <AlertDescription>
                  Choose your own custom username for £{customPrice.toFixed(2)}
                </AlertDescription>
              </Alert>

              <Button onClick={() => setShowCustomDialog(true)} className="w-full" variant="outline">
                Make Your Own (£{customPrice.toFixed(2)})
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
