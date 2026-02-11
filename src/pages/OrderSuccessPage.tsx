import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/price';
import { useEffect, useState } from 'react';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<{ subtotal: number; gstAmount: number; total: number } | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('orderForContactUs') === '1') {
      sessionStorage.removeItem('orderForContactUs');
      navigate('/contact?fromOrder=1', { replace: true });
      return;
    }
    const raw = sessionStorage.getItem('lastOrderSummary');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { subtotal: number; gstAmount: number; total: number };
      setSummary(parsed);
    } catch {
      setSummary(null);
    }
  }, [navigate]);

  return (
    <EShopLayout>
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16 text-center max-w-full">
        <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Order Placed Successfully!</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-2">Thank you for your order.</p>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Order confirmation has been sent to your email.</p>
        {summary && (
          <div className="max-w-md mx-auto mb-6 sm:mb-8 text-left bg-card border border-border rounded-xl p-3 sm:p-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Product Total (Excl. GST)</span>
              <span>₹{formatPrice(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>GST @18%</span>
              <span>₹{formatPrice(summary.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Final Amount Paid</span>
              <span className="text-primary">₹{formatPrice(summary.total)}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <Link to="/account" className="inline-block"><Button variant="outline" className="w-full sm:w-auto min-h-[48px] touch-manipulation">View Orders</Button></Link>
          <Link to="/eshop" className="inline-block"><Button className="w-full sm:w-auto min-h-[48px] touch-manipulation">Continue Shopping</Button></Link>
        </div>
      </div>
    </EShopLayout>
  );
};

export default OrderSuccessPage;
