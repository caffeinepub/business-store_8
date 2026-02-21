import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useClearCart, imageBytesToUrl } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartProps {
  onClose?: () => void;
}

export default function Cart({ onClose }: CartProps) {
  const { data: cartItems = [], isLoading } = useGetCart();
  const clearCart = useClearCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (onClose) onClose();
    navigate({ to: '/checkout' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add some products to get started!
        </p>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Continue Shopping
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Shopping Cart</h2>
        <p className="text-sm text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-6">
        {cartItems.map((item, index) => {
          const imageUrl = imageBytesToUrl(item.image);
          return (
            <div key={`${item.id}-${index}`} className="flex gap-4 p-4 rounded-lg border bg-card">
              <img
                src={imageUrl}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md"
                onLoad={() => URL.revokeObjectURL(imageUrl)}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.description}
                </p>
                <p className="text-lg font-semibold text-primary mt-2">
                  ${(Number(item.price) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span className="text-primary">${(total / 100).toFixed(2)}</span>
        </div>

        <Button onClick={handleCheckout} className="w-full" size="lg">
          Proceed to Checkout
        </Button>

        <Button
          onClick={handleClearCart}
          variant="outline"
          className="w-full gap-2"
          disabled={clearCart.isPending}
        >
          {clearCart.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

