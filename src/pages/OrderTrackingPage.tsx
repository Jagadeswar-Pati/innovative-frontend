import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Search } from 'lucide-react';

const OrderTrackingPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Order tracking will be handled when backend is integrated
  };

  return (
    <Layout>
      <div className="network-bg py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 max-w-full">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Order Tracking
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter your order details to track your shipment
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input 
                    id="orderId" 
                    placeholder="e.g., ORD-12345678" 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="The email used for your order" 
                    className="bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full min-h-[48px] rounded-lg gap-2 touch-manipulation">
                  <Search className="w-4 h-4" />
                  Track Order
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Need help? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTrackingPage;
