import { useState, useEffect } from 'react';
import { useCreateUsername } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateGamerTag } from '../../utils/gamerTagGenerator';

interface AIUsernameGeneratorProps {
  onComplete: () => void;
}

export default function AIUsernameGenerator({ onComplete }: AIUsernameGeneratorProps) {
  const [currentUsername, setCurrentUsername] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationAttempts, setValidationAttempts] = useState(0);
  const createUsername = useCreateUsername();
  const { actor } = useActor();

  const generateAndValidateUsername = async () => {
    if (!actor) return;

    setIsValidating(true);
    setValidationAttempts((prev) => prev + 1);

    try {
      // Generate a new username
      const newUsername = generateGamerTag();
      setCurrentUsername(newUsername);

      // Validate with backend
      await actor.validateGeneratedUsername(newUsername.toLowerCase());

      // If validation passes, create the username
      await createUsername.mutateAsync(newUsername.toLowerCase());
      
      // Success - proceed to storefront
      onComplete();
    } catch (error: any) {
      // If validation fails, try again with a new username
      console.log('Username validation failed, generating new one...', error.message);
      
      // Add a small delay before retrying to avoid overwhelming the backend
      setTimeout(() => {
        generateAndValidateUsername();
      }, 500);
    } finally {
      setIsValidating(false);
    }
  };

  // Start generation on mount
  useEffect(() => {
    generateAndValidateUsername();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl">Generating Your GamerTag</DialogTitle>
              </div>
              <DialogDescription>
                Our AI is creating a unique username just for you...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Current Username Display */}
              <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5 text-center">
                {currentUsername ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Your GamerTag</p>
                    <p className="text-3xl font-bold text-primary animate-pulse">
                      {currentUsername}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Generating...</p>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <Alert className="border-primary/20 bg-primary/5">
                <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
                <AlertDescription>
                  {isValidating ? (
                    <>Validating username uniqueness...</>
                  ) : (
                    <>Creating your account...</>
                  )}
                </AlertDescription>
              </Alert>

              {/* Attempt Counter (for debugging, can be removed) */}
              {validationAttempts > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  Finding the perfect username... (Attempt {validationAttempts})
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
