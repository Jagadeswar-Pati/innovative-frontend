import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EShopLayout from '../components/EShopLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, deliveryApi, Address, Product } from '../services/api';
import { isContactUs3dProduct } from '@/utils/productHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { calculateGstBreakdown, formatPrice } from '@/utils/price';

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
  const [deliveryMethod, setDeliveryMethod] = useState<'default' | 'manual'>('default');
  const [deliveryAgreement, setDeliveryAgreement] = useState(false);
  const [deliveryMobileNumber, setDeliveryMobileNumber] = useState('');
  const [stateCharges, setStateCharges] = useState<{ defaultShippingCharge: number; manualBaseCharge: number } | null>(null);

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

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);
  const addressState = selectedAddr?.state || '';

  useEffect(() => {
    if (!addressState) {
      setStateCharges(null);
      return;
    }
    deliveryApi.getStateCharges(addressState).then((data) => {
      setStateCharges({
        defaultShippingCharge: data.defaultShippingCharge ?? 0,
        manualBaseCharge: data.manualBaseCharge ?? 0,
      });
    }).catch(() => setStateCharges({ defaultShippingCharge: 0, manualBaseCharge: 0 }));
  }, [addressState]);

  const checkoutItems = buyNowItem ? [{ product: buyNowItem.product, quantity: buyNowItem.quantity }] : items;
  const checkoutSubtotal = buyNowItem
    ? buyNowItem.product.price * buyNowItem.quantity
    : totalPrice;
  const breakdown = useMemo(() => calculateGstBreakdown(checkoutSubtotal), [checkoutSubtotal]);
  const shippingCharge = deliveryMethod === 'manual'
    ? (stateCharges?.manualBaseCharge ?? 0)
    : (stateCharges?.defaultShippingCharge ?? 0);
  const totalWithShipping = Math.round((breakdown.total + shippingCharge) * 100) / 100;

  const isManualValid = deliveryMethod !== 'manual' || (deliveryAgreement && /^[6-9]\d{9}$/.test(deliveryMobileNumber.replace(/\D/g, '')));

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const address = addresses.find((a) => a._id === selectedAddress);
    if (!address) return;
    if (deliveryMethod === 'manual') {
      if (!deliveryAgreement) {
        toast({ title: 'Agreement required', description: 'Please agree to provide your contact number for delivery communication.', variant: 'destructive' });
        return;
      }
      if (!/^[6-9]\d{9}$/.test(deliveryMobileNumber.replace(/\D/g, ''))) {
        toast({ title: 'Invalid mobile', description: 'Please enter a valid 10-digit mobile number for delivery.', variant: 'destructive' });
        return;
      }
    }
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
        deliveryMethod,
        ...(deliveryMethod === 'manual' && {
          deliveryAgreement: true,
          deliveryMobileNumber: deliveryMobileNumber.replace(/\D/g, '').slice(-10),
        }),
      };
      const res = await paymentsApi.createRazorpayOrder(payload);
      if (!res.success || !res.data) {
        const err = (res as { message?: string }).message;
        if (err) toast({ title: 'Error', description: err, variant: 'destructive' });
        return;
      }

      const totalPayableLabel = formatPrice(res.data.totalAmount ?? totalWithShipping);
      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        order_id: res.data.orderId,
        name: 'Innovative Hub',
        description: `Order Payment • Total Payable ₹${totalPayableLabel}`,
        notes: {
          totalPayable: `₹${totalPayableLabel}`,
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verify = await paymentsApi.verifyRazorpayPayment({
              ...response,
              products: payload.products,
              address: payload.address,
              deliveryMethod: payload.deliveryMethod,
              ...(payload.deliveryMethod === 'manual' && {
                deliveryAgreement: payload.deliveryAgreement,
                deliveryMobileNumber: payload.deliveryMobileNumber,
              }),
            });
            if (verify.success) {
              sessionStorage.setItem(
                'lastOrderSummary',
                JSON.stringify({
                  subtotal: breakdown.subtotal,
                  gstAmount: breakdown.gstAmount,
                  deliveryCharge: shippingCharge,
                  total: res.data.totalAmount ?? totalWithShipping,
                })
              );
              const hadContactUsOrder = checkoutItems.some((item) => isContactUs3dProduct(item.product));
              if (hadContactUsOrder) sessionStorage.setItem('orderForContactUs', '1');
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
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to place order', variant: 'destructive' });
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
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 max-w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Address Selection */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Delivery Address</h2>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr._id} className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${selectedAddress === addr._id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="mt-1 shrink-0" />
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

            {/* Delivery Method */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Delivery Method</h2>
              <div className="space-y-3">
                <label className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${deliveryMethod === 'default' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'default'} onChange={() => setDeliveryMethod('default')} className="mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Estimated State-wise Delivery</p>
                    <p className="text-sm text-muted-foreground">Prepaid delivery charge based on your state (included in total).</p>
                  </div>
                </label>
                <label className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${deliveryMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'manual'} onChange={() => setDeliveryMethod('manual')} className="mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Manual Delivery Agreement</p>
                    <p className="text-sm text-muted-foreground">Delivery charge will be confirmed and collected when shipment is processed. Final amount may vary.</p>
                    {deliveryMethod === 'manual' && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor="delivery-mobile" className="text-sm">Mobile Number (required)</Label>
                          <Input
                            id="delivery-mobile"
                            type="tel"
                            placeholder="10-digit mobile"
                            value={deliveryMobileNumber}
                            onChange={(e) => setDeliveryMobileNumber(e.target.value)}
                            className="mt-1 max-w-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="delivery-agreement"
                            checked={deliveryAgreement}
                            onCheckedChange={(v) => setDeliveryAgreement(v === true)}
                          />
                          <Label htmlFor="delivery-agreement" className="text-sm cursor-pointer">I agree to provide my contact number for delivery communication purposes.</Label>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Payment Method</h2>
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <p className="font-medium text-foreground">Razorpay</p>
                <p className="text-sm text-muted-foreground">Pay securely via UPI, Cards, Net Banking</p>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit">
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {checkoutItems.map(({ product, quantity }) => (
                <div key={product._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <span className="text-muted-foreground">{product.name.substring(0, 30)}... x{quantity}</span>
                  <span>₹{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Subtotal (Excluding GST)</span>
                <span>₹{formatPrice(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>GST @18%</span>
                <span>₹{formatPrice(breakdown.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Shipping</span>
                <span>₹{formatPrice(shippingCharge)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Payable</span>
                <span className="text-primary">₹{formatPrice(totalWithShipping)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder || (deliveryMethod === 'manual' && !isManualValid)}>
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default CheckoutPage;
