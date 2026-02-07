import { X, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Product } from '../utils/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '@/hooks/use-toast';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef<number | null>(null);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const stockStatus = (() => {
    if (product.stock <= 0) return { label: 'Out of stock', color: 'bg-destructive' };
    if (product.stock < 5) return { label: `Low stock (${product.stock})`, color: 'bg-destructive' };
    if (product.stock <= 10) return { label: `Limited stock (${product.stock})`, color: 'bg-yellow-500' };
    return { label: `In stock (${product.stock})`, color: 'bg-green-500' };
  })();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    addToCart(product);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setCurrentImageIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || product.images.length < 2 || isPaused) return;
    autoSlideRef.current = window.setInterval(() => {
      nextImage();
    }, 3000);
    return () => {
      if (autoSlideRef.current) window.clearInterval(autoSlideRef.current);
    };
  }, [isOpen, product.images.length, isPaused]);

  const quickNotes = (() => {
    const cleaned = product.shortDescription.replace(/^Applications:\s*/i, '').trim();
    if (!cleaned) return [];
    let parts = cleaned
      .split(/(?=To\s)/i)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length <= 1) {
      parts = cleaned
        .split(/[.\n;]+/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return parts;
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[85vh]">
        <DialogTitle className="sr-only">{product.name} - Quick View</DialogTitle>
        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto">
          {/* Image Section */}
          <div
            className="relative w-full md:w-1/2 aspect-square bg-secondary/30"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <img 
              src={product.images[currentImageIndex] || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
            
            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            
            {/* Image Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImageIndex === idx ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1 rounded">
                {discount}% OFF
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {product.name}
            </h2>
            
            {/* Quick Notes */}
            <div className="text-sm text-muted-foreground mb-4">
              <p className="font-medium text-foreground mb-2">Quick Notes</p>
              <ul className="space-y-1 list-disc list-inside">
                {quickNotes.slice(0, 8).map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-primary">₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.mrp}</span>
                  <span className="text-sm text-green-500 font-medium">{discount}% off</span>
                </>
              )}
            </div>
            
            {/* GST Note */}
            <p className="text-xs text-muted-foreground mb-4">
              {product.gstMode === 'excluding' ? '(excl. GST)' : '(incl. GST)'}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span className={`inline-block w-2 h-2 rounded-full ${stockStatus.color}`} />
              <span>{stockStatus.label}</span>
            </div>
            
            {/* SKU */}
            <p className="text-xs text-muted-foreground mb-6 text-right">
              SKU: <span className="font-medium">{product.sku}</span>
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button 
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                variant={inCart ? 'secondary' : 'default'}
              >
                <ShoppingCart className="w-4 h-4" />
                {inCart ? 'Added to Cart' : 'Add to Cart'}
              </Button>
              <Button 
                variant="outline"
                className={`gap-2 ${inWishlist ? 'text-destructive border-destructive' : ''}`}
                onClick={handleWishlistToggle}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
