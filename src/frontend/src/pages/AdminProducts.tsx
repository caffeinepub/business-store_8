import { useState } from 'react';
import { useGetProducts, useAddProduct, useUpdateProduct, useDeleteProduct, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Plus, Pencil, Trash2, Package, Info, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../backend';

export default function AdminProducts() {
  const { data: products = [], isLoading } = useGetProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<bigint | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageFile: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      imageFile: null,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.imageFile) {
      toast.error('Please fill in all fields and select an image');
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const imageBytes = new Uint8Array(await formData.imageFile.arrayBuffer());
      await addProduct.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: BigInt(priceInCents),
        imageBytes: imageBytes,
      });
      toast.success('Product added successfully!');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(error.message || 'Failed to add product');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      let imageBytes: Uint8Array | undefined = undefined;
      if (formData.imageFile) {
        imageBytes = new Uint8Array(await formData.imageFile.arrayBuffer());
      }

      await updateProduct.mutateAsync({
        id: editingProduct.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: BigInt(priceInCents),
        imageBytes: imageBytes,
      });
      toast.success('Product updated successfully!');
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      await deleteProduct.mutateAsync(deleteProductId);
      toast.success('Product deleted successfully!');
      setDeleteProductId(null);
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toFixed(2),
      imageFile: null,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container py-12">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Manage Products
            </h1>
            <p className="text-lg text-muted-foreground">Add, edit, and manage your product catalog</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shadow-soft hover:shadow-medium transition-all">
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Product</DialogTitle>
                <DialogDescription>Fill in the product details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name" className="text-base font-semibold">Product Name</Label>
                  <Input
                    id="add-name"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-description" className="text-base font-semibold">Description</Label>
                  <Textarea
                    id="add-description"
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-price" className="text-base font-semibold">Price ($)</Label>
                  <Input
                    id="add-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-image" className="text-base font-semibold">Product Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="add-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="h-12"
                    />
                    {formData.imageFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        {formData.imageFile.name}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Maximum file size: 5MB</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={addProduct.isPending}
                    className="flex-1 h-12 text-base font-semibold"
                  >
                    {addProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Product Management Guide</AlertTitle>
          <AlertDescription className="text-sm">
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Add Product" to create a new product listing</li>
              <li>Upload a high-quality image (max 5MB) for best results</li>
              <li>Set competitive pricing in USD</li>
              <li>Use the edit button to update product details</li>
              <li>Products appear instantly on your storefront</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex p-6 rounded-2xl bg-muted/50 mb-6">
            <Package className="h-20 w-20 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No products yet</h3>
          <p className="text-muted-foreground text-lg mb-6">Get started by adding your first product</p>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => {
            const imageUrl = imageBytesToUrl(product.image);
            return (
              <Card key={product.id.toString()} className="group flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-soft transition-all">
                <CardHeader className="p-0">
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(imageUrl)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <CardTitle className="text-xl mb-2 line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mb-3 text-base">
                    {product.description}
                  </CardDescription>
                  <p className="text-2xl font-bold text-primary">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex gap-3">
                  <Button
                    onClick={() => openEditDialog(product)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeleteProductId(product.id)}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base font-semibold">Product Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-base font-semibold">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price" className="text-base font-semibold">Price ($)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image" className="text-base font-semibold">Product Image (optional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="h-12"
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to keep current image. Maximum file size: 5MB
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateProduct.isPending}
                className="flex-1 h-12 text-base font-semibold"
              >
                {updateProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProduct.isPending}
              className="h-11 bg-destructive hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
