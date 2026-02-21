import { useGetProducts, useAddToCart, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState } from 'react';

export default function ProductCatalog() {
  const { data: products = [], isLoading } = useGetProducts();
  const addToCart = useAddToCart();
  const { identity } = useInternetIdentity();
  const [addingProductId, setAddingProductId] = useState<bigint | null>(null);

  const handleAddToCart = async (productId: bigint) => {
    if (!identity) {
      toast.error('Please log in to add items to cart');
      return;
    }

    setAddingProductId(productId);
    try {
      await addToCart.mutateAsync(productId);
      toast.success('Added to cart!');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      if (error.message?.includes('Unauthorized')) {
        toast.error('Please log in to add items to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-[400px] bg-gradient-to-r from-primary/20 to-accent/20 overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Business Store"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end">
          <div className="container pb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Business Store</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover our curated collection of quality products
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">Our Products</h2>
          <p className="text-muted-foreground">Browse our selection and find what you need</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-1" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products available</h3>
            <p className="text-muted-foreground">Check back soon for new items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const imageUrl = product.image.length > 0 
                ? imageBytesToUrl(product.image)
                : '/assets/generated/product-placeholder.dim_300x300.png';
              const isAdding = addingProductId === product.id;

              return (
                <Card key={product.id.toString()} className="flex flex-col hover:shadow-medium transition-shadow">
                  <CardHeader className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onLoad={() => {
                          if (product.image.length > 0) {
                            URL.revokeObjectURL(imageUrl);
                          }
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">
                      {product.description}
                    </CardDescription>
                    <p className="text-2xl font-bold text-primary">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isAdding || !identity}
                      className="w-full gap-2"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

