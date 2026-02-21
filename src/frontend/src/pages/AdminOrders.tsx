import { useState } from 'react';
import { useGetOrders, imageBytesToUrl } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, ShoppingBag } from 'lucide-react';

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useGetOrders();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Orders</h1>
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Orders will appear here once customers make purchases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id.toString()}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order.id.toString()}
                    <Badge variant="secondary">{order.products.length} items</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Customer: {order.customer.toString().slice(0, 20)}...
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ${(Number(order.total) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="items" className="border-none">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-sm font-medium">View Order Details</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {order.products.map((product, index) => {
                        const imageUrl = imageBytesToUrl(product.image);
                        return (
                          <div key={`${product.id}-${index}`} className="flex gap-4 p-3 rounded-lg border bg-muted/30">
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
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${(Number(order.total) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>Free</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span className="text-primary">${(Number(order.total) / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

