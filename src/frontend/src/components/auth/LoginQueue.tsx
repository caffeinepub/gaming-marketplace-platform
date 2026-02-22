import { useState, useEffect, useRef } from 'react';
import { Loader2, Youtube, Instagram } from 'lucide-react';
import { useGetInstagramUrl, useGetPaymentDetails } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import QueueSkipDialog from './QueueSkipDialog';

interface LoginQueueProps {
  onQueueComplete: () => void;
}

export default function LoginQueue({ onQueueComplete }: LoginQueueProps) {
  const [position, setPosition] = useState<number>(() => {
    // Generate random starting position between 20 seconds and 5 minutes (300 seconds)
    return Math.floor(Math.random() * (300 - 20 + 1)) + 20;
  });
  
  const initialPosition = useRef(position);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: instagramUrl = '' } = useGetInstagramUrl();
  const { data: paymentDetails } = useGetPaymentDetails();
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);

  useEffect(() => {
    if (position <= 0) {
      onQueueComplete();
      return;
    }

    // Generate random delay between 20 seconds and 5 minutes (20000ms to 300000ms)
    const randomDelay = Math.floor(Math.random() * (300000 - 20000 + 1)) + 20000;

    timeoutRef.current = setTimeout(() => {
      setPosition((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, randomDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [position, onQueueComplete]);

  const queueSkipPrice = paymentDetails?.queueSkipPriceGBP ?? 0.05;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/generated/gaming-background.mp4" type="video/mp4" />
      </video>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 p-8 flex-1 flex flex-col items-center justify-center">
        <div className="space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to GameVault
          </h1>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-lg">Your position in queue</p>
          <div className="text-7xl font-bold text-primary animate-pulse">
            {position}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2 w-64 mx-auto bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
              style={{ width: `${100 - (position / initialPosition.current) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your experience...
          </p>
          
          {/* Skip Queue Button */}
          <Button
            onClick={() => setSkipDialogOpen(true)}
            variant="outline"
            size="lg"
            className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Skip Queue for £{queueSkipPrice.toFixed(2)}
          </Button>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="relative z-10 pb-8 flex items-center gap-6">
        <a
          href="https://youtube.com/@fros7yyt?si=u4-j8LrTkNuj7wUo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 hover:bg-background transition-colors border border-border hover:border-primary group"
        >
          <Youtube className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">YouTube</span>
        </a>
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 hover:bg-background transition-colors border border-border hover:border-accent group"
          >
            <Instagram className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Instagram</span>
          </a>
        )}
      </div>

      {/* Queue Skip Dialog */}
      <QueueSkipDialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen} />
    </div>
  );
}
