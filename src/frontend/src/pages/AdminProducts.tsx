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
import { Loader2, Plus, Pencil, Trash2, Package, Info } from 'lucide-react';
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
        imageBytes,
      });

      toast.success('Product added successfully!');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct || !formData.name.trim() || !formData.description.trim() || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      let imageBytes: Uint8Array | undefined;
      if (formData.imageFile) {
        imageBytes = new Uint8Array(await formData.imageFile.arrayBuffer());
      }

      await updateProduct.mutateAsync({
        id: editingProduct.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: BigInt(priceInCents),
        imageBytes,
      });

      toast.success('Product updated successfully!');
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      await deleteProduct.mutateAsync(deleteProductId);
      toast.success('Product deleted successfully!');
      setDeleteProductId(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
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
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Products</h1>
          <p className="text-muted-foreground">Add, edit, or remove products from your store</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Fill in the product details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Product Name</Label>
                <Input
                  id="add-name"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  name="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-price">Price ($)</Label>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-image">Product Image</Label>
                <Input
                  id="add-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {formData.imageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.imageFile.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={addProduct.isPending}>
                {addProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Instructions */}
      <Alert className="mb-8 border-primary/20 bg-primary/5">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold">How to Upload Products</AlertTitle>
        <AlertDescription className="text-sm space-y-2 mt-2">
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Click the <strong className="text-foreground">"Add Product"</strong> button above to open the product form</li>
            <li>Fill in the product details including name, description, and price</li>
            <li>Select an image file for your product (maximum size: <strong className="text-foreground">5MB</strong>)</li>
            <li>Click <strong className="text-foreground">"Add Product"</strong> to save your new product to the store</li>
          </ol>
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrl = imageBytesToUrl(product.image);
            return (
              <Card key={product.id.toString()}>
                <CardHeader className="p-0">
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(imageUrl)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mb-3">
                    {product.description}
                  </CardDescription>
                  <p className="text-2xl font-bold text-primary">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => setDeleteProductId(product.id)}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price ($)</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Product Image (optional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.imageFile && (
                <p className="text-sm text-muted-foreground">
                  New image: {formData.imageFile.name}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Product...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
