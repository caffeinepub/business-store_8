import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetOrder, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, ShoppingBag, FileText } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(BigInt(orderId));

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4">
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
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex p-6 rounded-full bg-accent/10 mb-6">
          <CheckCircle2 className="h-20 w-20 text-accent" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">Order Details</CardTitle>
          </div>
          <CardDescription className="text-base">Order #{order.id.toString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Items Ordered</h3>
            {order.products.map((product, index) => {
              const imageUrl = imageBytesToUrl(product.image);
              return (
                <div key={`${product.id}-${index}`} className="flex gap-4 p-4 rounded-xl border-2 bg-card hover:border-primary/30 transition-colors">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">{product.name}</p>
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

          <Separator />

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

          <div className="pt-4 space-y-3">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/orders/$orderId', params: { orderId } })}
              className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/50 transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Order Details
            </Button>
            <Link to="/">
              <Button className="w-full h-14 text-lg font-bold shadow-soft hover:shadow-medium transition-all" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
