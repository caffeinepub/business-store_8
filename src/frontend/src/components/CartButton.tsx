import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useGetCart } from '../hooks/useQueries';
import Cart from './Cart';

export default function CartButton() {
  const { data: cartItems = [] } = useGetCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative gap-2 font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
          <ShoppingCart className="h-5 w-5" />
          Cart
          {cartItems.length > 0 && (
            <Badge variant="default" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-primary to-accent border-2 border-background">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto border-l-2">
        <Cart onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
