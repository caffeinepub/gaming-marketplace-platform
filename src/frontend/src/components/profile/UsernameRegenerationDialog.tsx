import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetPaymentDetails, useGetCallerUserProfile } from '../../hooks/useQueries';
import { CreditCard, Gift, Coins, RefreshCw } from 'lucide-react';
import PaymentMethodCard from '../checkout/PaymentMethodCard';
import UsernameRegenerationPaymentForm from './UsernameRegenerationPaymentForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UsernameRegenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HARDCODED_CRYPTO_ADDRESS = 'bc1q9jqngrwkpay42hvdmcl2lnyh3y4fx7l7ufh722';

export default function UsernameRegenerationDialog({ open, onOpenChange }: UsernameRegenerationDialogProps) {
  const { data: paymentDetails, isLoading } = useGetPaymentDetails();
  const { data: userProfile } = useGetCallerUserProfile();

  if (isLoading) {
    return null;
  }

  const usernameChangePrice = paymentDetails?.usernameRegenerationPriceGBP ?? 0.01;
  const currentUsername = userProfile?.username || 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Regenerate Username for £{usernameChangePrice.toFixed(2)}
          </DialogTitle>
          <DialogDescription>
            Pay using one of the methods below to get a new AI-generated GamerTag.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Current Username Display */}
            <Alert className="border-primary/20 bg-primary/5">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Username:</span>
                  <span className="text-lg font-bold text-primary">{currentUsername}</span>
                </div>
              </AlertDescription>
            </Alert>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Payment Methods</h3>
              <div className="grid gap-4">
                <PaymentMethodCard
                  title="PayPal"
                  description="Send payment via PayPal"
                  details={paymentDetails?.paypalEmail || ''}
                  icon={<CreditCard className="h-6 w-6 text-primary" />}
                />
                <PaymentMethodCard
                  title="UK Gift Card"
                  description="Redeem a UK gift card"
                  details={paymentDetails?.ukGiftCardInstructions || ''}
                  icon={<Gift className="h-6 w-6 text-primary" />}
                />
                <PaymentMethodCard
                  title="Cryptocurrency"
                  description="Send crypto to our wallet"
                  details={HARDCODED_CRYPTO_ADDRESS}
                  icon={<Coins className="h-6 w-6 text-primary" />}
                />
              </div>
            </div>

            {/* Payment Proof Submission Form */}
            <UsernameRegenerationPaymentForm onSuccess={() => onOpenChange(false)} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
