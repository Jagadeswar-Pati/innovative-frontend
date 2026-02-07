import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EShopLayout from '../components/EShopLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, Address, Product } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<{ product: Product; quantity: number } | null>(null);

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress?._id || '');
    }
  }, [user]);

  useEffect(() => {
    const raw = sessionStorage.getItem('buyNowItem');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { product: Product; quantity: number };
      if (parsed?.product && parsed?.quantity) {
        setBuyNowItem(parsed);
      }
    } catch {
      sessionStorage.removeItem('buyNowItem');
    }
  }, []);

  const checkoutItems = buyNowItem ? [{ product: buyNowItem.product, quantity: buyNowItem.quantity }] : items;
  const checkoutTotal = buyNowItem
    ? buyNowItem.product.price * buyNowItem.quantity
    : totalPrice;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const address = addresses.find((a) => a._id === selectedAddress);
    if (!address) return;
    for (const item of checkoutItems) {
      if (item.product.stock > 0 && item.quantity > item.product.stock) {
        toast({ title: 'Not enough stock', description: `Reduce quantity for ${item.product.name}.`, variant: 'destructive' });
        return;
      }
    }
    try {
      setIsPlacingOrder(true);
      await loadRazorpay();
      const payload = {
        products: checkoutItems.map(({ product, quantity }) => ({
          productId: product._id,
          qty: quantity,
        })),
        address,
      };
      const res = await paymentsApi.createRazorpayOrder(payload);
      if (!res.success || !res.data) return;

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        order_id: res.data.orderId,
        name: 'Innovative Hub',
        description: 'Order Payment',
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verify = await paymentsApi.verifyRazorpayPayment({
              ...response,
              ...payload,
            });
            if (verify.success) {
              if (buyNowItem) {
                sessionStorage.removeItem('buyNowItem');
                setBuyNowItem(null);
              } else {
                clearCart();
              }
              navigate('/order-success');
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
          }
        },
        modal: {
          ondismiss: async () => {
            await paymentsApi.reportFailure({ reason: 'Checkout dismissed' });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (resp: { error?: { description?: string } }) => {
        await paymentsApi.reportFailure({ reason: resp?.error?.description || 'Payment failed' });
      });
      razorpay.open();
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (checkoutItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <EShopLayout>
      <div className="container mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Delivery Address</h2>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr._id} className={`flex flex-col sm:flex-row gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress === addr._id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground">{addr.fullName}</p>
                      <p className="text-sm text-muted-foreground">{addr.addressLine1}, {addr.addressLine2}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-muted-foreground">{addr.mobile}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Payment Method</h2>
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <p className="font-medium text-foreground">Razorpay</p>
                <p className="text-sm text-muted-foreground">Pay securely via UPI, Cards, Net Banking</p>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {checkoutItems.map(({ product, quantity }) => (
                <div key={product._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <span className="text-muted-foreground">{product.name.substring(0, 30)}... x{quantity}</span>
                  <span>₹{product.price * quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{checkoutTotal}</span></div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default CheckoutPage;
