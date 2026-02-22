import { useState } from 'react';
import { useGetQueueSkipSubmissions, useFlagQueueSkipFraud } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QueueSkipSubmission, QueueSkipStatus, GiftCardType } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';

export default function QueueSkipSubmissionsList() {
  const { data: submissions = [], isLoading } = useGetQueueSkipSubmissions();
  const flagFraud = useFlagQueueSkipFraud();
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleViewScreenshot = (submission: QueueSkipSubmission) => {
    // Only show screenshot viewer if it's not a gift card submission
    if (submission.giftCardCode) {
      toast.info('Gift card submissions do not have screenshots');
      return;
    }
    // Note: The backend no longer stores screenshots, so this won't work
    // We'll keep the UI for backwards compatibility but it won't display anything
    toast.info('Screenshot viewing is not available for this submission');
  };

  const handleFlagFraud = (userPrincipal: string) => {
    setSelectedUser(userPrincipal);
    setFlagDialogOpen(true);
  };

  const confirmFlagFraud = async () => {
    if (!selectedUser) return;

    try {
      const principal = Principal.fromText(selectedUser);
      await flagFraud.mutateAsync(principal);
      toast.success('Submission flagged as fraudulent and user blocked');
      setFlagDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Flag fraud error:', error);
      toast.error(error.message || 'Failed to flag submission');
    }
  };

  const getStatusBadge = (status: QueueSkipStatus) => {
    switch (status) {
      case 'pendingReview':
        return <Badge variant="outline">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'flaggedFraudulent':
        return <Badge variant="destructive">Flagged Fraudulent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGiftCardTypeLabel = (type: GiftCardType) => {
    switch (type) {
      case GiftCardType.amazon:
        return 'Amazon UK';
      case GiftCardType.tesco:
        return 'Tesco UK';
      case GiftCardType.starbucks:
        return 'Starbucks UK';
      case GiftCardType.cryptocurrency:
        return 'Cryptocurrency';
      case GiftCardType.other:
        return 'Other';
      default:
        return type;
    }
  };

  const getPaymentMethodLabel = (submission: QueueSkipSubmission) => {
    if (submission.giftCardCode) {
      return 'Gift Card';
    }
    if (submission.giftCardType === GiftCardType.cryptocurrency) {
      return 'Cryptocurrency';
    }
    return 'PayPal';
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString();
  };

  // Sort submissions by timestamp descending (most recent first)
  const sortedSubmissions = [...submissions].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue Skip Submissions</CardTitle>
          <CardDescription>Review and manage queue skip payment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Queue Skip Submissions</CardTitle>
          <CardDescription>Review and manage queue skip payment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Principal</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Gift Card Type</TableHead>
                  <TableHead>Gift Card Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubmissions.map((submission) => (
                  <TableRow key={submission.user.toString()}>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">
                      {submission.user.toString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatTimestamp(submission.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getPaymentMethodLabel(submission)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{submission.transactionId}</TableCell>
                    <TableCell>
                      {submission.giftCardCode ? getGiftCardTypeLabel(submission.giftCardType) : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-[150px] truncate">
                      {submission.giftCardCode || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleFlagFraud(submission.user.toString())}
                          disabled={submission.status === 'flaggedFraudulent' || flagFraud.isPending}
                        >
                          {flagFraud.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Flag className="h-4 w-4 mr-1" />
                              Flag
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot Viewer Dialog (kept for backwards compatibility but won't be used) */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {selectedScreenshot && (
            <div className="mt-4">
              <img
                src={selectedScreenshot}
                alt="Payment screenshot"
                className="w-full h-auto rounded-lg border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Fraud Confirmation Dialog */}
      <AlertDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag as Fraudulent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the user's queue bypass status and block them from submitting future queue skip requests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFlagFraud} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Flag as Fraudulent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
