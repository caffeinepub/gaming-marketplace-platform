import { useState } from 'react';
import { useGetCustomUsernameSubmissions, useApproveCustomUsername, useRejectCustomUsername } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { CustomUsernameSubmission, CustomUsernameStatus } from '../../backend';

export default function CustomUsernameSubmissionsList() {
  const { data: submissions, isLoading } = useGetCustomUsernameSubmissions();
  const approveCustomUsername = useApproveCustomUsername();
  const rejectCustomUsername = useRejectCustomUsername();
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  const handleApprove = async (userPrincipal: string) => {
    try {
      await approveCustomUsername.mutateAsync(userPrincipal);
      toast.success('Custom username approved successfully!');
    } catch (error: any) {
      console.error('Failed to approve custom username:', error);
      toast.error(error.message || 'Failed to approve custom username');
    }
  };

  const handleReject = async (userPrincipal: string) => {
    try {
      await rejectCustomUsername.mutateAsync(userPrincipal);
      toast.success('Custom username rejected');
    } catch (error: any) {
      console.error('Failed to reject custom username:', error);
      toast.error(error.message || 'Failed to reject custom username');
    }
  };

  const getStatusBadge = (status: CustomUsernameStatus) => {
    switch (status) {
      case CustomUsernameStatus.pendingReview:
        return <Badge variant="outline">Pending Review</Badge>;
      case CustomUsernameStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case CustomUsernameStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentMethodBadge = (submission: CustomUsernameSubmission) => {
    const method = submission.paymentMethod;
    if (method === 'paypal') {
      return <Badge variant="secondary">PayPal</Badge>;
    } else if (method === 'crypto') {
      return <Badge variant="secondary">Crypto</Badge>;
    } else if (method === 'giftCard') {
      return <Badge variant="secondary">Gift Card</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const extractScreenshotUrl = (transactionDetails: string): string | null => {
    const match = transactionDetails.match(/Screenshot: (https?:\/\/[^\s,]+)/);
    return match ? match[1] : null;
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
          <CardTitle>Custom Username Submissions</CardTitle>
          <CardDescription>No custom username submissions yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Custom Username Submissions</CardTitle>
          <CardDescription>Review and approve custom username payment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Requested Username</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => {
                  const userPrincipal = submission.user.toString();
                  const truncatedPrincipal = `${userPrincipal.slice(0, 8)}...${userPrincipal.slice(-6)}`;
                  const timestamp = new Date(Number(submission.timestamp) / 1000000).toLocaleString();
                  const screenshotUrl = extractScreenshotUrl(submission.transactionDetails);

                  return (
                    <TableRow key={userPrincipal}>
                      <TableCell className="font-mono text-xs" title={userPrincipal}>
                        {truncatedPrincipal}
                      </TableCell>
                      <TableCell className="text-sm">{timestamp}</TableCell>
                      <TableCell className="font-semibold">{submission.requestedUsername}</TableCell>
                      <TableCell>{getPaymentMethodBadge(submission)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground truncate">
                            {submission.transactionDetails}
                          </p>
                          {screenshotUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingScreenshot(screenshotUrl)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Screenshot
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {submission.status === CustomUsernameStatus.pendingReview && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(userPrincipal)}
                                disabled={approveCustomUsername.isPending || rejectCustomUsername.isPending}
                              >
                                {approveCustomUsername.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(userPrincipal)}
                                disabled={approveCustomUsername.isPending || rejectCustomUsername.isPending}
                              >
                                {rejectCustomUsername.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot Viewer Dialog */}
      <Dialog open={!!viewingScreenshot} onOpenChange={() => setViewingScreenshot(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {viewingScreenshot && (
            <div className="flex items-center justify-center">
              <img
                src={viewingScreenshot}
                alt="Payment screenshot"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
