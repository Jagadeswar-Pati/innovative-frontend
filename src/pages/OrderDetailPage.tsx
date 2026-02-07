import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EShopLayout from '../components/EShopLayout';
import { ordersApi, Order } from '../services/api';

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await ordersApi.getById(orderId!);
        if (response.success && response.data) {
          setOrder(response.data as Order);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusBadge = (status: Order['orderStatus']) => {
    const statusConfig = {
      Placed: { label: 'Placed', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      Packed: { label: 'Packed', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      Shipped: { label: 'Shipped', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      Delivered: { label: 'Delivered', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      Cancelled: { label: 'Cancelled', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const config = statusConfig[status] || statusConfig.Placed;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    const statusConfig = {
      Pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      Paid: { label: 'Paid', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      Failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTrackingSteps = (status: Order['orderStatus']) => {
    const steps = [
      { key: 'Placed', label: 'Order Placed', icon: Clock, description: 'Your order has been placed' },
      { key: 'Packed', label: 'Confirmed', icon: Package, description: 'Order confirmed by seller' },
      { key: 'Shipped', label: 'Shipped', icon: Truck, description: 'Package is on the way' },
      { key: 'Delivered', label: 'Delivered', icon: CheckCircle, description: 'Package delivered' },
    ];

    const statusOrder = ['Placed', 'Packed', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex && status !== 'Cancelled',
      isCurrent: index === currentIndex && status !== 'Cancelled',
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <EShopLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </EShopLayout>
    );
  }

  if (!order) {
    return (
      <EShopLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/account')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </EShopLayout>
    );
  }

  const trackingSteps = getTrackingSteps(order.orderStatus);

  return (
    <EShopLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order {order._id}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(order.orderStatus)}
            {getPaymentBadge(order.paymentStatus)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.orderStatus === 'Cancelled' ? (
                  <div className="text-center py-4">
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-base px-4 py-2">
                      Order Cancelled
                    </Badge>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex justify-between">
                      {trackingSteps.map((step, index) => (
                        <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              step.isCompleted
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-background border-border text-muted-foreground'
                            }`}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>
                          <div className="mt-2 text-center">
                            <p className={`text-sm font-medium ${step.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground hidden md:block">
                              {step.description}
                            </p>
                          </div>
                          {/* Connecting line */}
                          {index < trackingSteps.length - 1 && (
                            <div
                              className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 ${
                                trackingSteps[index + 1].isCompleted ? 'bg-primary' : 'bg-border'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.trackingLink && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking Link</p>
                        <p className="font-mono font-medium truncate max-w-[200px]">{order.trackingLink}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.trackingLink} target="_blank" rel="noopener noreferrer">
                          Track Package
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {order.trackingMessage && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tracking Message</p>
                    <p className="text-sm text-foreground mt-1">{order.trackingMessage}</p>
                  </div>
                )}

                {order.invoiceUrl && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice</p>
                        <p className="font-mono font-medium truncate max-w-[200px]">{order.invoiceNumber || 'Invoice'}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                          Download Invoice
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {order.estimatedDelivery && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        Estimated Delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({order.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.products.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.productId}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name || 'Product'}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.price * item.qty}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                    {index < order.products.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{order.totalAmount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.address.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.address.mobile}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.address.addressLine1}
                    {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="text-sm font-medium">{order.paymentMethod || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getPaymentBadge(order.paymentStatus)}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => navigate('/account')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/contact">Need Help?</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default OrderDetailPage;
