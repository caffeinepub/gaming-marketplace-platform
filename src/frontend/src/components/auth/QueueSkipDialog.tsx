import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetPaymentDetails } from '../../hooks/useQueries';
import { CreditCard, Gift, Coins } from 'lucide-react';
import PaymentMethodCard from '../checkout/PaymentMethodCard';
import QueueSkipPaymentForm from './QueueSkipPaymentForm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QueueSkipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HARDCODED_CRYPTO_ADDRESS = 'bc1q9jqngrwkpay42hvdmcl2lnyh3y4fx7l7ufh722';

export default function QueueSkipDialog({ open, onOpenChange }: QueueSkipDialogProps) {
  const { data: paymentDetails, isLoading } = useGetPaymentDetails();

  if (isLoading) {
    return null;
  }

  const queueSkipPrice = paymentDetails?.queueSkipPriceGBP ?? 0.05;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Skip Queue for £{queueSkipPrice.toFixed(2)}</DialogTitle>
          <DialogDescription>
            Pay using one of the methods below and submit your payment proof to bypass the queue instantly.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
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
            <QueueSkipPaymentForm onSuccess={() => onOpenChange(false)} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
