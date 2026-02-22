import { useState } from 'react';
import { useCreateUsername } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UsernameSetupProps {
  onComplete: () => void;
}

export default function UsernameSetup({ onComplete }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const createUsername = useCreateUsername();

  const validateUsername = (value: string): string | null => {
    if (value.length < 5) {
      return 'Username must be at least 5 characters long';
    }

    // Check alphanumeric only (lowercase letters and numbers)
    const alphanumericRegex = /^[a-z0-9]+$/;
    if (!alphanumericRegex.test(value)) {
      return 'Username must only contain lowercase letters and numbers';
    }

    return null;
  };

  const handleUsernameChange = (value: string) => {
    // Convert to lowercase automatically
    const lowercaseValue = value.toLowerCase();
    setUsername(lowercaseValue);
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    // Client-side validation
    const error = validateUsername(trimmedUsername);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await createUsername.mutateAsync(trimmedUsername);
      onComplete();
    } catch (error: any) {
      // Handle backend validation errors
      const errorMessage = error?.message || 'Failed to create username';
      
      if (errorMessage.includes('already taken')) {
        setValidationError('This username is already taken. Please choose another.');
      } else if (errorMessage.includes('forbidden words')) {
        setValidationError('This username contains inappropriate content. Please choose another.');
      } else if (errorMessage.includes('at least 5 characters')) {
        setValidationError('Username must be at least 5 characters long');
      } else if (errorMessage.includes('lowercase letters and numbers')) {
        setValidationError('Username must only contain lowercase letters and numbers');
      } else {
        setValidationError(errorMessage);
      }
    }
  };

  const isValid = username.trim().length >= 5 && !validationError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl">Choose Your Username</DialogTitle>
              <DialogDescription>
                Create a unique username to complete your profile. This will be visible to other users.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username (min 5 characters)"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  autoFocus
                  disabled={createUsername.isPending}
                  className={validationError ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters and numbers allowed
                </p>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {username.length >= 5 && !validationError && !createUsername.isPending && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Username looks good!
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createUsername.isPending || !isValid}
              >
                {createUsername.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Username...
                  </>
                ) : (
                  'Create Username'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
