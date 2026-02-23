import { Link, useNavigate } from '@tanstack/react-router';
import { useGetMyOrders, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, ShoppingBag, ChevronRight } from 'lucide-react';

export default function MyAccount() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetMyOrders();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Sort orders by ID descending (most recent first)
  const sortedOrders = orders ? [...orders].sort((a, b) => Number(b.id - a.id)) : [];

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Account
            </h1>
            <p className="text-lg text-muted-foreground mt-1">View your order history</p>
          </div>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">No orders yet</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Start shopping to see your orders here. Browse our collection of amazing products!
          </p>
          <Link to="/">
            <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-soft hover:shadow-medium transition-all">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            // Calculate order date from order ID (simple approximation)
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Number(sortedOrders[0].id - order.id));
            
            return (
              <Card
                key={order.id.toString()}
                className="border-2 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id.toString() } })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        Order #{order.id.toString()}
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardTitle>
                      <CardDescription className="text-base">
                        Placed on {orderDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ${(Number(order.total) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {order.products.slice(0, 4).map((product, index) => {
                      const imageUrl = imageBytesToUrl(product.image);
                      return (
                        <div key={`${product.id}-${index}`} className="flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border-2"
                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/generated/product-placeholder.dim_300x300.png';
                            }}
                          />
                        </div>
                      );
                    })}
                    {order.products.length > 4 && (
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                        <span className="text-sm font-semibold text-muted-foreground">
                          +{order.products.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
                    </p>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
