import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import { Button } from '@/components/ui/button';

const OrderSuccessPage = () => {
  return (
    <EShopLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-2">Thank you for your order.</p>
        <p className="text-muted-foreground mb-8">Order confirmation has been sent to your email.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/account"><Button variant="outline">View Orders</Button></Link>
          <Link to="/eshop"><Button>Continue Shopping</Button></Link>
        </div>
      </div>
    </EShopLayout>
  );
};

export default OrderSuccessPage;
