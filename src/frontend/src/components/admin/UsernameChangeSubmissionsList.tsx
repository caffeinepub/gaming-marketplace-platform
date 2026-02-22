import { useGetUsernameChangeSubmissions, useFlagUsernameChangeFraud } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Flag, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { QueueSkipSubmission, QueueSkipStatus, GiftCardType } from '../../backend';

export default function UsernameChangeSubmissionsList() {
  const { data: submissions = [], isLoading } = useGetUsernameChangeSubmissions();
  const flagFraud = useFlagUsernameChangeFraud();

  const handleFlagFraud = async (userPrincipal: string) => {
    try {
      await flagFraud.mutateAsync(userPrincipal);
      toast.success('Submission flagged as fraudulent');
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
        return 'Other/PayPal';
      default:
        return type;
    }
  };

  const truncatePrincipal = (principal: string) => {
    if (principal.length <= 20) return principal;
    return `${principal.slice(0, 10)}...${principal.slice(-10)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No username change submissions yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username Change Submissions</CardTitle>
        <CardDescription>Review and manage username regeneration payment submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Gift Card Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission: QueueSkipSubmission) => (
                <TableRow key={submission.user.toString()}>
                  <TableCell className="font-mono text-xs">
                    {truncatePrincipal(submission.user.toString())}
                  </TableCell>
                  <TableCell>
                    {new Date(Number(submission.timestamp) / 1000000).toLocaleString()}
                  </TableCell>
                  <TableCell>{getGiftCardTypeLabel(submission.giftCardType)}</TableCell>
                  <TableCell className="font-mono text-xs">{submission.transactionId}</TableCell>
                  <TableCell>
                    {submission.giftCardCode ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Type: {getGiftCardTypeLabel(submission.giftCardType)}
                        </div>
                        <div className="font-mono text-xs">Code: {submission.giftCardCode}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Screenshot submitted</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>
                    {submission.status !== 'flaggedFraudulent' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleFlagFraud(submission.user.toString())}
                        disabled={flagFraud.isPending}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Flag Fraud
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
