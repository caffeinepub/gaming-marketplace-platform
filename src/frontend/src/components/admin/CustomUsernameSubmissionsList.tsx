import { useState, useEffect } from 'react';
import { useGetCustomUsernameSubmissions, useApproveCustomUsername, useRejectCustomUsername, useGetUserProfile } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { CustomUsernameSubmission, CustomUsernameStatus, UserProfile } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';

export default function CustomUsernameSubmissionsList() {
  const { data: submissions, isLoading } = useGetCustomUsernameSubmissions();
  const approveCustomUsername = useApproveCustomUsername();
  const rejectCustomUsername = useRejectCustomUsername();
  const getUserProfile = useGetUserProfile();
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loadingUsernames, setLoadingUsernames] = useState(false);

  // Fetch user profiles for all submissions
  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!submissions || submissions.length === 0) return;
      
      setLoadingUsernames(true);
      const profileMap: Record<string, UserProfile> = {};
      
      for (const submission of submissions) {
        try {
          const profile = await getUserProfile.mutateAsync(submission.user);
          if (profile) {
            profileMap[submission.user.toString()] = profile;
          }
        } catch (error) {
          console.error('Failed to fetch profile for user:', submission.user.toString(), error);
        }
      }
      
      setUserProfiles(profileMap);
      setLoadingUsernames(false);
    };

    fetchUserProfiles();
  }, [submissions]);

  const handleApprove = async (userPrincipal: string) => {
    try {
      const principal = Principal.fromText(userPrincipal);
      await approveCustomUsername.mutateAsync(principal);
      toast.success('Custom username approved successfully!');
    } catch (error: any) {
      console.error('Failed to approve custom username:', error);
      toast.error(error.message || 'Failed to approve custom username');
    }
  };

  const handleReject = async (userPrincipal: string) => {
    try {
      const principal = Principal.fromText(userPrincipal);
      await rejectCustomUsername.mutateAsync(principal);
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
          <CardDescription>Review and approve custom username requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Username</TableHead>
                  <TableHead>Requested Username</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => {
                  const userPrincipalStr = submission.user.toString();
                  const profile = userProfiles[userPrincipalStr];
                  const screenshotUrl = extractScreenshotUrl(submission.transactionDetails);

                  return (
                    <TableRow key={userPrincipalStr}>
                      <TableCell className="font-mono text-xs">
                        {userPrincipalStr.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {loadingUsernames ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : profile ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{profile.username || 'N/A'}</span>
                            <span className="text-xs text-muted-foreground">{profile.userId}</span>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{submission.requestedUsername}</TableCell>
                      <TableCell>{getPaymentMethodBadge(submission)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate max-w-[200px]">
                            {submission.transactionDetails}
                          </span>
                          {screenshotUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingScreenshot(screenshotUrl)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {submission.status === CustomUsernameStatus.pendingReview && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(userPrincipalStr)}
                              disabled={approveCustomUsername.isPending}
                            >
                              {approveCustomUsername.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(userPrincipalStr)}
                              disabled={rejectCustomUsername.isPending}
                            >
                              {rejectCustomUsername.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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

      <Dialog open={!!viewingScreenshot} onOpenChange={() => setViewingScreenshot(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {viewingScreenshot && (
            <img
              src={viewingScreenshot}
              alt="Payment screenshot"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
