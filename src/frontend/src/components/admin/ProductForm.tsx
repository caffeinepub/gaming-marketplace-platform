import { useState, useEffect } from 'react';
import { Product, ProductType } from '../../backend';
import { ExternalBlob } from '../../backend';
import { useCreateProduct, useUpdateProduct, useGetAllCategories } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductForm({ product, open, onOpenChange }: ProductFormProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useGetAllCategories();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<ProductType>(ProductType.account);
  const [priceGBP, setPriceGBP] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [gameCategory, setGameCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (product) {
      setId(product.id);
      setName(product.name);
      setDescription(product.description);
      setProductType(product.productType);
      setPriceGBP(product.priceGBP.toString());
      setQuantityAvailable(product.quantityAvailable.toString());
      setGameCategory(product.gameCategory);
    } else {
      resetForm();
    }
  }, [product, open]);

  const resetForm = () => {
    setId('');
    setName('');
    setDescription('');
    setProductType(ProductType.account);
    setPriceGBP('');
    setQuantityAvailable('');
    setGameCategory('');
    setImageFile(null);
    setUploadProgress(0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !product) {
      toast.error('Please select an image');
      return;
    }

    try {
      let imageBlob: ExternalBlob;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else {
        imageBlob = product!.image;
      }

      const productData: Product = {
        id: product ? product.id : id,
        name,
        description,
        productType,
        priceGBP: parseFloat(priceGBP),
        quantityAvailable: BigInt(quantityAvailable),
        gameCategory,
        imageUrls: [],
        image: imageBlob,
      };

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, product: productData });
        toast.success('Product updated successfully!');
      } else {
        await createProduct.mutateAsync({ id, product: productData });
        toast.success('Product created successfully!');
      }

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!product && (
            <div className="space-y-2">
              <Label htmlFor="id">Product ID</Label>
              <Input id="id" value={id} onChange={(e) => setId(e.target.value)} required />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type</Label>
              <Select value={productType} onValueChange={(value) => setProductType(value as ProductType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductType.account}>Account</SelectItem>
                  <SelectItem value={ProductType.currency}>Currency</SelectItem>
                  <SelectItem value={ProductType.clothes}>Clothes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameCategory">Game Category</Label>
              <Select value={gameCategory} onValueChange={setGameCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (GBP)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={priceGBP}
                onChange={(e) => setPriceGBP(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Available</Label>
              <Input
                id="quantity"
                type="number"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center gap-4">
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : product ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
