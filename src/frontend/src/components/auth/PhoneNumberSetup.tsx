import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Phone } from 'lucide-react';
import { useSavePhoneNumber } from '../../hooks/usePhoneNumber';
import { toast } from 'sonner';

interface PhoneNumberSetupProps {
  open: boolean;
  onComplete: () => void;
}

export default function PhoneNumberSetup({ open, onComplete }: PhoneNumberSetupProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const savePhoneNumber = useSavePhoneNumber();

  const validatePhoneNumber = (value: string): boolean => {
    // Remove any non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) {
      setError('Phone number is required');
      return false;
    }
    
    // Check for plus sign
    if (value.includes('+')) {
      setError('Phone number must not include the + prefix');
      return false;
    }
    
    setError('');
    return true;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    setPhoneNumber(digitsOnly);
    
    if (digitsOnly.length > 0) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    try {
      await savePhoneNumber.mutateAsync(phoneNumber);
      toast.success('Phone number saved successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Failed to save phone number:', error);
      const errorMessage = error.message || 'Failed to save phone number';
      
      if (errorMessage.includes('already exists')) {
        setError('This phone number is already registered');
        toast.error('Phone number already registered');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleAddPhoneNumber = () => {
    setShowForm(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Phone Number Required
          </DialogTitle>
          <DialogDescription>
            Please add your phone number to continue. This is required for account verification.
          </DialogDescription>
        </DialogHeader>
        
        {!showForm ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To access the platform, you need to add a phone number to your account.
            </p>
            <Button
              onClick={handleAddPhoneNumber}
              className="w-full"
            >
              Add Phone Number
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number (digits only, no + prefix)
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="1234567890"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                disabled={savePhoneNumber.isPending}
                className={error ? 'border-destructive' : ''}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your phone number with digits only (e.g., 1234567890, 447123456789)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={savePhoneNumber.isPending || phoneNumber.length === 0}
            >
              {savePhoneNumber.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
