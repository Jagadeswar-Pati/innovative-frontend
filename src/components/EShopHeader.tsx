import { Link, useLocation } from 'react-router-dom';
import { Menu, User, Heart, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCategories } from '../hooks/useCategories';
import CategorySidebar from './CategorySidebar';
import logo from '@/assets/logo.png';

interface EShopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const EShopHeader = ({ searchQuery = '', onSearchChange }: EShopHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { categories } = useCategories();

  return (
    <>
      <CategorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Menu Button - Opens Category Sidebar */}
            <button
              className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open categories"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo - Links to Landing Page */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src={logo} 
                alt="Innovative Hub" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <span className="hidden sm:block text-lg md:text-xl font-bold text-foreground">
                Innovative <span className="text-foreground">Hub</span>
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/account">
                <Button variant="default" size="sm" className="gap-2 rounded-full px-5 hidden md:flex">
                  <User className="w-4 h-4" />
                  My Account
                </Button>
              </Link>
              
              <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>
              
              <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 bg-secondary/50"
              />
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-2 py-3 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={category.slug === 'all' ? '/eshop' : `/eshop/products?category=${category.slug}`}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  location.search.includes(category.slug) || (category.slug === 'all' && location.pathname === '/eshop')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                {category.name}
              </Link>
            ))}
            <Link 
              to="/wishlist"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-secondary/50 text-foreground hover:bg-secondary whitespace-nowrap transition-colors"
            >
              <Heart className="w-4 h-4" />
              Wish List
            </Link>
            <Link 
              to="/cart"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground whitespace-nowrap transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add To Cart
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default EShopHeader;
