import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';

const CartPage = () => {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <EShopLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Link to="/eshop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </EShopLayout>
    );
  }

  return (
    <EShopLayout>
      <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-8">Shopping Cart ({totalItems} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-card border border-border rounded-xl p-3 sm:p-4">
                <img src={product.images[0] || '/placeholder.svg'} alt={product.name} className="w-full sm:w-24 h-32 sm:h-24 object-contain bg-secondary/30 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product._id}`} className="font-medium text-sm sm:text-base text-foreground hover:text-primary line-clamp-2">{product.name}</Link>
                  <p className="text-xs sm:text-sm text-muted-foreground">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <span className="font-bold text-primary text-sm sm:text-base">₹{product.price}</span>
                    {product.mrp > product.price && <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{product.mrp}</span>}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => updateQuantity(product._id, quantity - 1)} className="p-1.5 sm:p-2 hover:bg-secondary"><Minus className="w-3 h-3" /></button>
                    <span className="px-2 sm:px-3 text-sm">{quantity}</span>
                    <button onClick={() => updateQuantity(product._id, quantity + 1)} className="p-1.5 sm:p-2 hover:bg-secondary"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="font-bold text-sm sm:text-base">₹{product.price * quantity}</span>
                  <button onClick={() => removeFromCart(product._id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit">
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-2 mb-3 sm:mb-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>₹{totalPrice}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>Free</span></div>
            </div>
            <div className="border-t border-border pt-3 sm:pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between text-base sm:text-lg font-bold"><span>Total</span><span>₹{totalPrice}</span></div>
            </div>
            <Link to="/checkout"><Button className="w-full" size="lg">Proceed to Checkout</Button></Link>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default CartPage;
