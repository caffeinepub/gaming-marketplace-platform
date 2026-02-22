import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck } from 'lucide-react';

interface TermsAcceptanceModalProps {
  onAccept: () => void;
}

export default function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-2xl">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent 
            className="sm:max-w-2xl" 
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl">Terms & Conditions</DialogTitle>
              </div>
              <DialogDescription>
                Please read and accept our terms before proceeding to create your account.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-6 py-4">
                <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <p className="text-lg leading-relaxed text-foreground">
                    We at Game Vault have no partition with any hacking or scamming or 3rd party selling
                  </p>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    By accepting these terms, you acknowledge that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>You will not engage in any fraudulent activities</li>
                    <li>You will not use third-party services for unauthorized transactions</li>
                    <li>You understand that hacking and scamming are strictly prohibited</li>
                    <li>Violation of these terms may result in account suspension</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button 
                onClick={onAccept}
                className="w-full sm:w-auto"
                size="lg"
              >
                I Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
