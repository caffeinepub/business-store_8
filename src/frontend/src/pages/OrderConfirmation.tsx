import { useParams, Link } from '@tanstack/react-router';
import { useGetOrder, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const { data: order, isLoading } = useGetOrder(BigInt(orderId));

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Order not found</h2>
          <p className="text-muted-foreground">
            We couldn't find the order you're looking for.
          </p>
          <Link to="/">
            <Button>Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been received.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order #{order.id.toString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold">Items Ordered</h3>
            {order.products.map((product, index) => {
              const imageUrl = imageBytesToUrl(product.image);
              return (
                <div key={`${product.id}-${index}`} className="flex gap-4 p-3 rounded-lg border">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md"
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-semibold text-primary mt-1">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${(Number(order.total) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">${(Number(order.total) / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/">
              <Button className="w-full" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

