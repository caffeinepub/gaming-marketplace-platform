import { useState, useEffect } from 'react';
import { useCreateUsername } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Sparkles } from 'lucide-react';
import { generateGamerTag } from '../../utils/gamerTagGenerator';
import { Button } from '@/components/ui/button';
import CustomUsernameDialog from './CustomUsernameDialog';

interface AIUsernameGeneratorProps {
  onComplete: () => void;
}

export default function AIUsernameGenerator({ onComplete }: AIUsernameGeneratorProps) {
  const [currentUsername, setCurrentUsername] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const createUsername = useCreateUsername();
  const { actor } = useActor();

  const generateAndValidateUsername = async () => {
    if (!actor) return;

    setIsValidating(true);

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
      // If validation fails (duplicate), try again immediately
      if (error.message?.includes('already taken') || error.message?.includes('bombsawayYYYYYY')) {
        // Retry immediately without delay
        generateAndValidateUsername();
      } else {
        console.error('Username validation error:', error);
        // For other errors, retry after a short delay
        setTimeout(() => {
          generateAndValidateUsername();
        }, 100);
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Start generation on mount
  useEffect(() => {
    if (actor && !showCustomDialog) {
      generateAndValidateUsername();
    }
  }, [actor, showCustomDialog]);

  if (showCustomDialog) {
    return <CustomUsernameDialog open={true} onOpenChange={setShowCustomDialog} onSuccess={onComplete} />;
  }

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

              {/* Make Your Own Button */}
              <div className="space-y-3">
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
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCustomDialog(true)}
                  disabled={isValidating}
                >
                  Make Your Own (£0.10)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
