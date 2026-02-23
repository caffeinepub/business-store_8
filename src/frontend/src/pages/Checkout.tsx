import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useCheckout, imageBytesToUrl } from '../hooks/useQueries';
import { PaymentMethod } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ShoppingCart, CreditCard, Wallet, Banknote } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { data: cartItems = [], isLoading: cartLoading } = useGetCart();
  const checkout = useCheckout();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.cashOnDelivery);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const orderId = await checkout.mutateAsync(paymentMethod);
      toast.success('Order placed successfully!');
      navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
    } catch (error: any) {
      console.error('Checkout failed:', error);
      if (error.message?.includes('empty cart')) {
        toast.error('Your cart is empty');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    }
  };

  if (cartLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex p-6 rounded-2xl bg-muted/50">
            <ShoppingCart className="h-20 w-20 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground text-lg">
              Add some products before checking out.
            </p>
          </div>
          <Button onClick={() => navigate({ to: '/' })} size="lg" className="gap-2">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Checkout
        </h1>
        <p className="text-lg text-muted-foreground">Complete your purchase</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Checkout Form */}
        <div>
          <Card className="border-2">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Shipping Information</CardTitle>
              </div>
              <CardDescription className="text-base">Enter your delivery details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-semibold">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base font-semibold">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-base font-semibold">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="10001"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={PaymentMethod.cashOnDelivery} id="cod" />
                      <Label
                        htmlFor="cod"
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Banknote className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={PaymentMethod.upi} id="upi" />
                      <Label
                        htmlFor="upi"
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">UPI</p>
                          <p className="text-sm text-muted-foreground">Pay using UPI apps</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-8 h-14 text-lg font-bold shadow-soft hover:shadow-medium transition-all"
                  size="lg"
                  disabled={checkout.isPending}
                >
                  {checkout.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - $${(total / 100).toFixed(2)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-2 sticky top-24">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Order Summary</CardTitle>
              <CardDescription className="text-base">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item, index) => {
                  const imageUrl = imageBytesToUrl(item.image);
                  return (
                    <div key={`${item.id}-${index}`} className="flex gap-4 p-3 rounded-xl border-2 bg-card">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onLoad={() => URL.revokeObjectURL(imageUrl)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">{item.name}</p>
                        <p className="text-lg font-bold text-primary mt-1">
                          ${(Number(item.price) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-3 bg-muted/30 rounded-xl p-5">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${(total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
