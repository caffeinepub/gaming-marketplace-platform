import { useState } from 'react';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductList from '../components/admin/ProductList';
import ProductForm from '../components/admin/ProductForm';
import CategoryList from '../components/admin/CategoryList';
import CategoryForm from '../components/admin/CategoryForm';
import PaymentConfigForm from '../components/admin/PaymentConfigForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function AdminPanel() {
  const { data: userRole, isLoading } = useGetCallerUserRole();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access the admin panel.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your marketplace products, categories, and payment settings.</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="payments">Payment Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Product Management</h2>
              <Button onClick={() => setProductFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
            <ProductList />
            <ProductForm product={null} open={productFormOpen} onOpenChange={setProductFormOpen} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Category Management</h2>
              <Button onClick={() => setCategoryFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <CategoryList />
            <CategoryForm category={null} open={categoryFormOpen} onOpenChange={setCategoryFormOpen} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentConfigForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
