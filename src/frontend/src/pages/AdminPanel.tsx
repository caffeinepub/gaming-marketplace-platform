import { useGetCallerUserRole } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductList from '../components/admin/ProductList';
import CategoryList from '../components/admin/CategoryList';
import PaymentConfigForm from '../components/admin/PaymentConfigForm';
import QueueSkipSubmissionsList from '../components/admin/QueueSkipSubmissionsList';
import UsernameChangeSubmissionsList from '../components/admin/UsernameChangeSubmissionsList';
import CustomUsernameSubmissionsList from '../components/admin/CustomUsernameSubmissionsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';
import { UserRole } from '../backend';

export default function AdminPanel() {
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== UserRole.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You do not have permission to access the admin panel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only administrators can access this page. If you believe this is an error, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage products, categories, payments, and submissions</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="queue-skip">Queue Skip</TabsTrigger>
          <TabsTrigger value="username-changes">Username Changes</TabsTrigger>
          <TabsTrigger value="custom-usernames">Custom Usernames</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductList />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryList />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentConfigForm />
        </TabsContent>

        <TabsContent value="queue-skip">
          <QueueSkipSubmissionsList />
        </TabsContent>

        <TabsContent value="username-changes">
          <UsernameChangeSubmissionsList />
        </TabsContent>

        <TabsContent value="custom-usernames">
          <CustomUsernameSubmissionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
