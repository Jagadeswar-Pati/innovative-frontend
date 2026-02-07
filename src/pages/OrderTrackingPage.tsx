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
      <div className="network-bg py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Order Tracking
              </h1>
              <p className="text-muted-foreground">
                Enter your order details to track your shipment
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
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
                <Button type="submit" className="w-full rounded-lg gap-2">
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
