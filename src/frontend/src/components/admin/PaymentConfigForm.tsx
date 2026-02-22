import { useState, useEffect } from 'react';
import { useGetPaymentDetails, useUpdatePaymentDetails, useAddAdminUsername, useAddAdminPhoneNumber } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, UserPlus, Phone } from 'lucide-react';

export default function PaymentConfigForm() {
  const { data: paymentDetails, isLoading } = useGetPaymentDetails();
  const updatePaymentDetails = useUpdatePaymentDetails();
  const addAdminUsername = useAddAdminUsername();
  const addAdminPhoneNumber = useAddAdminPhoneNumber();

  const [paypalEmail, setPaypalEmail] = useState('');
  const [ukGiftCardInstructions, setUkGiftCardInstructions] = useState('');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [queueSkipPriceGBP, setQueueSkipPriceGBP] = useState('0.05');
  const [usernameRegenerationPriceGBP, setUsernameRegenerationPriceGBP] = useState('0.01');
  const [customUsernamePriceGBP, setCustomUsernamePriceGBP] = useState('0.10');
  
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPhoneNumber, setNewAdminPhoneNumber] = useState('');

  useEffect(() => {
    if (paymentDetails) {
      setPaypalEmail(paymentDetails.paypalEmail || '');
      setUkGiftCardInstructions(paymentDetails.ukGiftCardInstructions || '');
      setCryptoWalletAddress(paymentDetails.cryptoWalletAddress || '');
      setInstagramUrl(paymentDetails.instagramUrl || '');
      setQueueSkipPriceGBP(paymentDetails.queueSkipPriceGBP.toFixed(2));
      setUsernameRegenerationPriceGBP(paymentDetails.usernameRegenerationPriceGBP.toFixed(2));
      setCustomUsernamePriceGBP(paymentDetails.customUsernamePriceGBP.toFixed(2));
    }
  }, [paymentDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const queueSkipPrice = parseFloat(queueSkipPriceGBP);
    const usernameRegenerationPrice = parseFloat(usernameRegenerationPriceGBP);
    const customUsernamePrice = parseFloat(customUsernamePriceGBP);

    if (isNaN(queueSkipPrice) || queueSkipPrice < 0) {
      toast.error('Queue skip price must be a valid positive number');
      return;
    }

    if (isNaN(usernameRegenerationPrice) || usernameRegenerationPrice < 0) {
      toast.error('Username regeneration price must be a valid positive number');
      return;
    }

    if (isNaN(customUsernamePrice) || customUsernamePrice < 0) {
      toast.error('Custom username price must be a valid positive number');
      return;
    }

    try {
      await updatePaymentDetails.mutateAsync({
        paypalEmail: paypalEmail.trim(),
        ukGiftCardInstructions: ukGiftCardInstructions.trim(),
        cryptoWalletAddress: cryptoWalletAddress.trim(),
        instagramUrl: instagramUrl.trim(),
        queueSkipPriceGBP: queueSkipPrice,
        usernameRegenerationPriceGBP: usernameRegenerationPrice,
        customUsernamePriceGBP: customUsernamePrice,
      });
      toast.success('Payment configuration updated successfully!');
    } catch (error: any) {
      console.error('Failed to update payment config:', error);
      toast.error(error.message || 'Failed to update payment configuration');
    }
  };

  const handleAddAdminUsername = async () => {
    if (!newAdminUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      await addAdminUsername.mutateAsync(newAdminUsername.trim());
      toast.success('Admin username added successfully!');
      setNewAdminUsername('');
    } catch (error: any) {
      console.error('Failed to add admin username:', error);
      toast.error(error.message || 'Failed to add admin username');
    }
  };

  const handleAddAdminPhoneNumber = async () => {
    const phoneNumber = newAdminPhoneNumber.trim();
    
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate phone number format (11 digits, no +)
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 11) {
      toast.error('Phone number must be 11 digits (UK format without +)');
      return;
    }

    try {
      await addAdminPhoneNumber.mutateAsync(digitsOnly);
      toast.success('Admin phone number added successfully!');
      setNewAdminPhoneNumber('');
    } catch (error: any) {
      console.error('Failed to add admin phone number:', error);
      toast.error(error.message || 'Failed to add admin phone number');
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    setNewAdminPhoneNumber(digitsOnly);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Configuration</CardTitle>
        <CardDescription>Configure payment methods and pricing for your storefront</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Management Section */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-lg font-semibold">Admin Management</h3>
            
            <div className="space-y-3">
              <Label htmlFor="newAdminUsername">Add Admin by Username</Label>
              <div className="flex gap-2">
                <Input
                  id="newAdminUsername"
                  type="text"
                  placeholder="Enter username"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  disabled={addAdminUsername.isPending}
                />
                <Button
                  type="button"
                  onClick={handleAddAdminUsername}
                  disabled={addAdminUsername.isPending || !newAdminUsername.trim()}
                  variant="outline"
                >
                  {addAdminUsername.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Admin
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="newAdminPhoneNumber">Add Admin by Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="newAdminPhoneNumber"
                  type="tel"
                  placeholder="07123456789 (11 digits, no +)"
                  value={newAdminPhoneNumber}
                  onChange={handlePhoneNumberChange}
                  maxLength={11}
                  disabled={addAdminPhoneNumber.isPending}
                />
                <Button
                  type="button"
                  onClick={handleAddAdminPhoneNumber}
                  disabled={addAdminPhoneNumber.isPending || newAdminPhoneNumber.length !== 11}
                  variant="outline"
                >
                  {addAdminPhoneNumber.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Add Admin
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter UK phone number without the + prefix (e.g., 07123456789)
              </p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>
            
            <div className="space-y-2">
              <Label htmlFor="queueSkipPrice">Queue Skip Price (£)</Label>
              <Input
                id="queueSkipPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.05"
                value={queueSkipPriceGBP}
                onChange={(e) => setQueueSkipPriceGBP(e.target.value)}
                required
                disabled={updatePaymentDetails.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usernameRegenerationPrice">Username Regeneration Price (£)</Label>
              <Input
                id="usernameRegenerationPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.01"
                value={usernameRegenerationPriceGBP}
                onChange={(e) => setUsernameRegenerationPriceGBP(e.target.value)}
                required
                disabled={updatePaymentDetails.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customUsernamePrice">Custom Username Price (£)</Label>
              <Input
                id="customUsernamePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.10"
                value={customUsernamePriceGBP}
                onChange={(e) => setCustomUsernamePriceGBP(e.target.value)}
                required
                disabled={updatePaymentDetails.isPending}
              />
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Methods</h3>
            
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="your-paypal@example.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                disabled={updatePaymentDetails.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ukGiftCardInstructions">UK Gift Card Instructions</Label>
              <Textarea
                id="ukGiftCardInstructions"
                placeholder="Instructions for customers on how to use UK gift cards..."
                value={ukGiftCardInstructions}
                onChange={(e) => setUkGiftCardInstructions(e.target.value)}
                rows={4}
                disabled={updatePaymentDetails.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cryptoWalletAddress">Crypto Wallet Address</Label>
              <Input
                id="cryptoWalletAddress"
                type="text"
                placeholder="bc1q..."
                value={cryptoWalletAddress}
                onChange={(e) => setCryptoWalletAddress(e.target.value)}
                disabled={updatePaymentDetails.isPending}
              />
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Media</h3>
            
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                type="url"
                placeholder="https://instagram.com/yourusername"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                disabled={updatePaymentDetails.isPending}
              />
            </div>
          </div>

          <Button type="submit" disabled={updatePaymentDetails.isPending} className="w-full">
            {updatePaymentDetails.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
