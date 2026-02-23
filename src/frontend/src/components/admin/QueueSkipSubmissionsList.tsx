import { useGetQueueSkipSubmissionsWithUsernames, useFlagQueueSkipFraud } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { QueueSkipStatus, GiftCardType } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';

export default function QueueSkipSubmissionsList() {
  const { data: submissions, isLoading } = useGetQueueSkipSubmissionsWithUsernames();
  const flagFraud = useFlagQueueSkipFraud();

  const handleFlagFraud = async (userPrincipal: string) => {
    try {
      const principal = Principal.fromText(userPrincipal);
      await flagFraud.mutateAsync(principal);
      toast.success('Submission flagged as fraudulent');
    } catch (error: any) {
      console.error('Failed to flag fraud:', error);
      toast.error(error.message || 'Failed to flag submission');
    }
  };

  const getStatusBadge = (status: QueueSkipStatus) => {
    switch (status) {
      case QueueSkipStatus.pendingReview:
        return <Badge variant="outline">Pending Review</Badge>;
      case QueueSkipStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case QueueSkipStatus.flaggedFraudulent:
        return <Badge variant="destructive">Fraudulent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getGiftCardTypeBadge = (type: GiftCardType) => {
    const typeMap = {
      [GiftCardType.amazon]: 'Amazon',
      [GiftCardType.starbucks]: 'Starbucks',
      [GiftCardType.tesco]: 'Tesco',
      [GiftCardType.cryptocurrency]: 'Cryptocurrency',
      [GiftCardType.other]: 'Other',
    };
    return <Badge variant="secondary">{typeMap[type] || 'Unknown'}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue Skip Submissions</CardTitle>
          <CardDescription>No queue skip submissions yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Skip Submissions</CardTitle>
        <CardDescription>Review and manage queue skip payment submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Gift Card Type</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Gift Card Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((item) => {
                const submission = item.submission;
                const userPrincipalStr = submission.user.toString();
                const timestamp = new Date(Number(submission.timestamp) / 1000000);

                return (
                  <TableRow key={userPrincipalStr}>
                    <TableCell className="font-mono text-xs">
                      {userPrincipalStr.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {item.username || 'N/A'}
                    </TableCell>
                    <TableCell>{timestamp.toLocaleString()}</TableCell>
                    <TableCell>{getGiftCardTypeBadge(submission.giftCardType)}</TableCell>
                    <TableCell className="font-mono text-xs">{submission.transactionId}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {submission.giftCardCode || 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.status !== QueueSkipStatus.flaggedFraudulent && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFlagFraud(userPrincipalStr)}
                          disabled={flagFraud.isPending}
                        >
                          {flagFraud.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Flag Fraud
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
