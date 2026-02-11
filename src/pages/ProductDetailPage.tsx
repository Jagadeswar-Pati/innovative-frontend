import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2 } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';
import type { Product } from '../utils/products';
import { slugify } from '../utils/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProductReviews from '@/components/ProductReviews';
import { formatPrice } from '@/utils/price';
import { isCustom3dProduct, CONTACT_US_3D_SKU } from '@/utils/productHelpers';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImagePaused, setIsImagePaused] = useState(false);
  const [isAddingContactUs, setIsAddingContactUs] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setIsLoading(true);
      try {
        const res = await productsApi.getById(id);
        if (res.success) {
          setProduct(res.data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!product) return;
      try {
        const res = await productsApi.getAll();
        if (res.success) {
          const list = res.data;
          setRelatedProducts(
            list.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 5)
          );
          setRecentProducts(list.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load related products:', error);
      }
    };
    loadRelated();
  }, [product]);

  useEffect(() => {
    if (!product || product.images.length < 2 || isImagePaused) return;
    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [product, isImagePaused]);

  if (!product && !isLoading) {
    return (
      <EShopLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/eshop" className="text-primary hover:underline">
            Back to E-Shop
          </Link>
        </div>
      </EShopLayout>
    );
  }

  if (!product) {
    return null;
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/eshop/products?search=${encodeURIComponent(value.trim())}`);
    }
  };

  const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const stockStatus = (() => {
    if (product.stock <= 0) return { label: 'Out of stock', color: 'bg-destructive' };
    if (product.stock < 5) return { label: `Low stock (${product.stock})`, color: 'bg-destructive' };
    if (product.stock <= 10) return { label: `Limited stock (${product.stock})`, color: 'bg-yellow-500' };
    return { label: `In stock (${product.stock})`, color: 'bg-green-500' };
  })();
  const isCustom3d = isCustom3dProduct(product);

  const shortDescParts = (() => {
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

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const rawLong = product.longDescription?.trim() || '';
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(rawLong);
  const formattedLongHtml = (() => {
    if (hasHtml) return rawLong;
    const lines = rawLong
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return '';
    const listLines = lines.filter((line) => /^(?:[-*•]|\d+\.)\s+/.test(line));
    const looksLikeList = listLines.length >= 2 && listLines.length / lines.length >= 0.6;
    if (looksLikeList) {
      const items = lines.map((line) => line.replace(/^(?:[-*•]|\d+\.)\s+/, ''));
      return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }
    const singleLine = lines.length === 1 ? lines[0] : '';
    if (singleLine) {
      const cleaned = singleLine.replace(/^Applications:\s*/i, '').trim();
      const toSplits = cleaned.split(/(?=To\s)/i).map((part) => part.trim()).filter(Boolean);
      const bulletSplits =
        toSplits.length > 1
          ? toSplits
          : cleaned
              .split(/[•;]+/)
              .map((part) => part.trim())
              .filter(Boolean);
      if (bulletSplits.length >= 3) {
        return `<ul>${bulletSplits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      }
    }
    return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  })();

  const handleAddToCart = () => {
    if (product.stock > 0 && quantity > product.stock) {
      toast({ title: 'Not enough stock', description: 'Please reduce the quantity.', variant: 'destructive' });
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    if (product.stock > 0 && quantity > product.stock) {
      toast({ title: 'Not enough stock', description: 'Please reduce the quantity.', variant: 'destructive' });
      return;
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify({ product, quantity }));
    navigate('/checkout');
  };

  const handleContactUs3d = async () => {
    setIsAddingContactUs(true);
    try {
      const res = await productsApi.getById(CONTACT_US_3D_SKU);
      if (res.success && res.data) {
        sessionStorage.setItem('buyNowItem', JSON.stringify({ product: res.data, quantity: 1 }));
        navigate('/checkout');
      } else {
        toast({ title: 'Error', description: 'Could not open checkout. Try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not open checkout. Try again.', variant: 'destructive' });
    } finally {
      setIsAddingContactUs(false);
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={handleSearchChange}>
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 max-w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/eshop" className="hover:text-foreground">E-Shop</Link>
          <span>/</span>
          <Link to={`/eshop/products?category=${slugify(product.category)}`} className="hover:text-foreground">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[140px] sm:max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="bg-secondary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-8 sm:mb-12 max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Image Gallery */}
            <div className="relative">
              <div
                className="aspect-square bg-background rounded-xl overflow-hidden"
                onMouseEnter={() => setIsImagePaused(true)}
                onMouseLeave={() => setIsImagePaused(false)}
                onTouchStart={() => setIsImagePaused(true)}
                onTouchEnd={() => setIsImagePaused(false)}
              >
                <img 
                  src={product.images[currentImageIndex] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 sm:p-8"
                />
              </div>
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img || '/placeholder.svg'} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                  {product.name}
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 min-h-[44px] min-w-[44px] touch-manipulation"
                  onClick={async () => {
                    const url = window.location.href;
                    try {
                      if (navigator.share) {
                        await navigator.share({ title: product.name, url });
                      } else if (navigator.clipboard) {
                        await navigator.clipboard.writeText(url);
                        toast({ title: 'Link copied', description: 'Share link copied to clipboard.' });
                      }
                    } catch (err) {
                      console.error('Share failed', err);
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Notes */}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">QUICK NOTES:</p>
                <ul className="space-y-1 list-disc list-inside">
                  {shortDescParts.slice(0, 8).map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">₹{formatPrice(product.price)}</span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">₹{formatPrice(product.mrp)}</span>
                      <span className="text-lg text-green-500 font-medium">{discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Price (Excluding GST)</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`inline-block w-2 h-2 rounded-full ${stockStatus.color}`} />
                  <span>{stockStatus.label}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 sm:px-4 text-base sm:text-lg font-medium min-w-[2.5rem] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const maxQty = product.stock > 0 ? product.stock : quantity + 1;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }}
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {isCustom3d ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Pay for order to open Contact Us — then we&apos;ll share instructions and contact number.
                  </p>
                  <Button size="lg" className="w-full min-h-[48px] touch-manipulation" onClick={handleContactUs3d} disabled={isAddingContactUs}>
                    {isAddingContactUs ? 'Opening checkout…' : 'Pay for order — Contact us for Custom 3D Printing'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button"
                    size="lg" 
                    className="flex-1 gap-2 min-h-[48px] touch-manipulation w-full"
                    onClick={handleAddToCart}
                    variant={inCart ? 'secondary' : 'default'}
                  >
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                    {inCart ? 'Added to Cart' : 'Add to Cart'}
                  </Button>
                  <Button type="button" size="lg" className="flex-1 min-h-[48px] touch-manipulation w-full" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>
              )}

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`flex items-center gap-2 text-sm min-h-[44px] touch-manipulation py-2 ${inWishlist ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`w-4 h-4 shrink-0 ${inWishlist ? 'fill-current' : ''}`} />
                  {inWishlist ? 'Wishlisted' : 'Add to wishlist'}
                </button>
                <span className="text-sm text-muted-foreground">
                  SKU: <span className="font-medium">{product.sku}</span>
                </span>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Payment Methods:</span>
                <span className="font-medium text-foreground">Razorpay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Description</h2>
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1 prose-strong:text-foreground prose-a:text-primary">
            <h3 className="text-lg font-semibold text-foreground mb-4">{product.name.split('|')[0]}</h3>
            <div
              className="text-muted-foreground whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: formattedLongHtml }}
            />
          </div>
        </section>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Specifications</h2>
            <div className="bg-secondary/20 rounded-xl p-6 overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key} className="border-b border-border last:border-0">
                      <td className="py-3 text-muted-foreground font-medium w-1/3">{key}</td>
                      <td className="py-3 text-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Reviews & Comments */}
        <ProductReviews productId={product._id} />

        {/* Datasheet */}
        {product.datasheet && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Datasheet of {product.name.split(' ')[0]}</h2>
            <div className="bg-secondary/20 rounded-xl p-6">
              <p className="text-muted-foreground">
                {product.datasheet} - This is the filler text to be filled in the line inf for need it and it may need.
              </p>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
              <Link to={`/eshop/products?category=${encodeURIComponent(product.category.toLowerCase())}`} className="text-sm text-primary hover:underline">
                VIEW SIMILAR
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </EShopLayout>
  );
};

export default ProductDetailPage;
