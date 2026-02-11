import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Heart, Settings, MapPin, LogOut, 
  ChevronRight, ExternalLink, Truck, Clock, CheckCircle2,
  Plus, Pencil, Trash2, Eye, EyeOff, ShoppingCart
} from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ordersApi, userApi, Order, Address } from '../services/api';
import { formatPrice } from '@/utils/price';

const AccountPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { addToCart } = useCart();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  // Settings form state
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Address form state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, '_id'>>({
    fullName: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load user data into forms
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || user.email?.split('@')[0] || '', mobile: user.mobile || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const response = await ordersApi.getMyOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } catch {
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Get wishlist products - wishlistItems is Product[]
  const wishlistProducts = wishlistItems;

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ name: profileForm.name, mobile: profileForm.mobile });
      if (res.success) toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive' 
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    
    setIsSavingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive' 
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle address save
  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = editingAddress?._id
        ? await userApi.updateAddress(editingAddress._id, addressForm)
        : await userApi.addAddress(addressForm);
      if (res.success && res.data) {
        setAddresses(res.data.addresses || []);
        toast({ title: 'Address saved', description: 'Your address has been saved.' });
      }
      setIsAddressDialogOpen(false);
      resetAddressForm();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save address',
        variant: 'destructive' 
      });
    }
  };

  // Handle address delete
  const handleAddressDelete = async (addressId: string) => {
    try {
      const res = await userApi.deleteAddress(addressId);
      if (res.success && res.data) {
        setAddresses(res.data.addresses || []);
        toast({ title: 'Address deleted', description: 'The address has been removed.' });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to delete address',
        variant: 'destructive' 
      });
    }
  };

  // Handle set default address
  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await userApi.setDefaultAddress(addressId);
      if (res.success && res.data) {
        setAddresses(res.data.addresses || []);
        toast({ title: 'Default address updated' });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to set default address',
        variant: 'destructive' 
      });
    }
  };

  // Reset address form
  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      mobile: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  // Open edit address dialog
  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      mobile: address.mobile,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault || false,
    });
    setIsAddressDialogOpen(true);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast({ title: 'Logged out', description: 'You have been logged out successfully.' });
  };

  // Move wishlist item to cart
  const moveToCart = (product: typeof wishlistProducts[0]) => {
    addToCart(product);
    removeFromWishlist(product._id);
    toast({ title: 'Added to cart', description: `${product.name} has been moved to your cart.` });
  };

  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
      'Placed': { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      'Packed': { variant: 'outline', icon: <Package className="w-3 h-3" /> },
      'Shipped': { variant: 'default', icon: <Truck className="w-3 h-3" /> },
      'Delivered': { variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const config = statusConfig[status] || statusConfig['Placed'];
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="network-bg py-6 sm:py-8 md:py-12 min-h-screen min-h-[100dvh]">
        <div className="container mx-auto px-3 sm:px-4 max-w-full">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!</p>
          </div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="bg-card/60 backdrop-blur-sm border border-border p-1 h-auto flex-wrap gap-1">
              <TabsTrigger value="orders" className="gap-2 min-h-[44px] touch-manipulation data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">My Orders</span>
                <span className="sm:hidden">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-2 min-h-[44px] touch-manipulation data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Wishlist</span>
                <span className="sm:hidden">Wishlist</span>
                {wishlistProducts.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {wishlistProducts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 min-h-[44px] touch-manipulation data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2 min-h-[44px] touch-manipulation data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Addresses</span>
                <span className="sm:hidden">Address</span>
              </TabsTrigger>
              <TabsTrigger value="logout" className="gap-2 min-h-[44px] touch-manipulation text-destructive data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </TabsTrigger>
            </TabsList>

            {/* My Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order History
                  </CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button asChild>
                        <Link to="/eshop">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                                <Badge variant="secondary" className="text-[10px]">
                                  {order.products.length} items
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>Payment: <span className="font-medium text-foreground">{order.paymentStatus}</span></span>
                                <span>•</span>
                                <span>Method: <span className="font-medium text-foreground">{order.paymentMethod || '—'}</span></span>
                              </div>
                              <p className="text-sm font-semibold text-primary">₹{formatPrice(order.totalAmount)}</p>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                              {getOrderStatusBadge(order.orderStatus)}
                              <div className="flex gap-2">
                                {order.trackingLink && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="gap-1">
                                      <Truck className="w-3 h-3" />
                                      Track
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="gap-1" asChild>
                                  <Link to={`/order/${order._id}`}>
                                    View Details
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    My Wishlist
                  </CardTitle>
                  <CardDescription>Products you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                      <Button asChild>
                        <Link to="/eshop/products">Browse Products</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistProducts.map((product) => (
                        <div
                          key={product._id}
                          className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                        >
                          <Link to={`/product/${product._id}`}>
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          </Link>
                          <h4 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-bold text-primary">₹{formatPrice(product.price)}</span>
                            <span className="text-xs text-muted-foreground line-through">₹{formatPrice(product.mrp)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => moveToCart(product)}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Add to Cart
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromWishlist(product._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Settings */}
                <Card className="bg-card/60 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Your name"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          id="mobile"
                          value={profileForm.mobile}
                          onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          className="bg-background/50"
                        />
                      </div>
                      <Button type="submit" disabled={isSavingProfile}>
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Password Settings */}
                <Card className="bg-card/60 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="••••••••"
                            className="bg-background/50 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="••••••••"
                            className="bg-background/50 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="bg-background/50 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" disabled={isSavingPassword}>
                        {isSavingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Address Book
                    </CardTitle>
                    <CardDescription>Manage your delivery addresses</CardDescription>
                  </div>
                  <Dialog open={isAddressDialogOpen} onOpenChange={(open) => {
                    setIsAddressDialogOpen(open);
                    if (!open) resetAddressForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Plus className="w-4 h-4" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                        <DialogDescription>
                          {editingAddress ? 'Update the address details below' : 'Enter the address details below'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddressSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={addressForm.fullName}
                              onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrMobile">Mobile</Label>
                            <Input
                              id="addrMobile"
                              value={addressForm.mobile}
                              onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            placeholder="House no, Street name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                          <Input
                            id="addressLine2"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            placeholder="Area, Landmark"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                              id="pincode"
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="rounded border-border"
                          />
                          <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                            Set as default address
                          </Label>
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {editingAddress ? 'Update Address' : 'Add Address'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No saved addresses</p>
                      <Button onClick={() => setIsAddressDialogOpen(true)}>
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`border rounded-lg p-4 relative ${
                            address.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          {address.isDefault && (
                            <Badge className="absolute top-2 right-2" variant="default">
                              Default
                            </Badge>
                          )}
                          <h4 className="font-medium mb-1">{address.fullName}</h4>
                          <p className="text-sm text-muted-foreground mb-1">{address.mobile}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditAddress(address)}
                              className="w-full sm:w-auto"
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            {!address.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => address._id && handleSetDefault(address._id)}
                                className="w-full sm:w-auto"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive w-full sm:w-auto"
                              onClick={() => address._id && handleAddressDelete(address._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logout Tab */}
            <TabsContent value="logout" className="space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </CardTitle>
                  <CardDescription>You will be logged out of your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-8">
                    <p className="text-muted-foreground mb-6 text-center">
                      Are you sure you want to sign out? You'll need to log in again to access your account.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="outline" onClick={() => setActiveTab('orders')}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleLogout} className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
