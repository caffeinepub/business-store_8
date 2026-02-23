import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetOrder, imageBytesToUrl, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Package, User } from 'lucide-react';

export default function OrderDetails() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading: orderLoading } = useGetOrder(BigInt(orderId));
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isLoading = orderLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Order not found</h2>
          <p className="text-muted-foreground text-lg">
            We couldn't find the order you're looking for.
          </p>
          <Link to="/">
            <Button size="lg">Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 -ml-2 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Order Details
            </h1>
            <p className="text-lg text-muted-foreground mt-1">Order #{order.id.toString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Customer Information */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <User className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-xl">Customer Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Name</p>
              <p className="text-lg font-semibold">
                {userProfile?.name || 'Customer'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Principal ID</p>
              <p className="font-mono text-sm bg-muted px-4 py-3 rounded-lg break-all">
                {order.customer.toString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Order Items</CardTitle>
            <CardDescription>
              {order.products.length} {order.products.length === 1 ? 'item' : 'items'} in this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((product, index) => {
                const imageUrl = imageBytesToUrl(product.image);
                return (
                  <div
                    key={`${product.id}-${index}`}
                    className="flex gap-4 p-4 rounded-xl border-2 bg-card hover:border-primary/30 transition-colors"
                  >
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                      onLoad={() => URL.revokeObjectURL(imageUrl)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/generated/product-placeholder.dim_300x300.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        ${(Number(product.price) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${(Number(order.total) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${(Number(order.total) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Link to="/">
            <Button className="w-full h-14 text-lg font-bold shadow-soft hover:shadow-medium transition-all" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
