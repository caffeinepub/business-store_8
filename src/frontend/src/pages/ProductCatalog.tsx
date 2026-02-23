import { useGetProducts, useAddToCart, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Loader2, Sparkles } from 'lucide-react';
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
      <div className="relative w-full h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/signage-hero.dim_1920x600.png"
            alt="OM FANCY & GIFT COLLECTION"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative container h-full flex flex-col justify-center items-start">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">New Collection Available</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg">
                OM FANCY & GIFT COLLECTION
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl drop-shadow-md">
              Make your own choice with premium outfit
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-3">Featured Products</h2>
          <p className="text-lg text-muted-foreground">Explore our handpicked selection</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="h-64 w-full rounded-none" />
                </CardHeader>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Skeleton className="h-11 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 rounded-2xl bg-muted/50 mb-6">
              <ShoppingCart className="h-20 w-20 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No products available</h3>
            <p className="text-muted-foreground text-lg">Check back soon for exciting new items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const imageUrl = product.image.length > 0 
                ? imageBytesToUrl(product.image)
                : '/assets/generated/product-placeholder.dim_300x300.png';
              const isAdding = addingProductId === product.id;

              return (
                <Card key={product.id.toString()} className="group flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onLoad={() => {
                          if (product.image.length > 0) {
                            URL.revokeObjectURL(imageUrl);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6">
                    <CardTitle className="text-xl mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-4 text-base">
                      {product.description}
                    </CardDescription>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isAdding || !identity}
                      className="w-full gap-2 h-12 text-base font-semibold shadow-soft hover:shadow-medium transition-all"
                      size="lg"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
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
