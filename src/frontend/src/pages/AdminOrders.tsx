import { useGetOrders, imageBytesToUrl } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingBag, ExternalLink } from 'lucide-react';

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useGetOrders();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Customer Orders
        </h1>
        <p className="text-lg text-muted-foreground">View and manage all customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex p-6 rounded-2xl bg-muted/50 mb-6">
            <ShoppingBag className="h-20 w-20 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No orders yet</h3>
          <p className="text-muted-foreground text-lg">Orders will appear here once customers make purchases</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Accordion type="single" collapsible className="space-y-4">
            {orders.map((order) => (
              <AccordionItem
                key={order.id.toString()}
                value={order.id.toString()}
                className="border-2 rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold">Order #{order.id.toString()}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${(Number(order.total) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Separator className="mb-6" />
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">CUSTOMER</h4>
                      <p className="font-mono text-sm bg-muted px-4 py-3 rounded-lg break-all">
                        {order.customer.toString()}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">ORDER ITEMS</h4>
                      <div className="space-y-3">
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
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-lg mb-1">{product.name}</h5>
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
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">${(Number(order.total) / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => navigate({ to: `/orders/${order.id.toString()}` })}
                        className="w-full h-12 text-base font-semibold shadow-soft hover:shadow-medium transition-all"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Order Details
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
