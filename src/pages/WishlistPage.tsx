import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
  return (
    <Layout>
      <div className="network-bg py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              My Wishlist
            </h1>
            <p className="text-muted-foreground mb-8">
              Save your favorite products here for easy access later.
            </p>

            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8">
              <p className="text-muted-foreground mb-6">
                Your wishlist is empty. Browse our products and add items you love!
              </p>
              <Link to="/eshop">
                <Button className="rounded-lg">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
  }

  return (
    <Layout>
      <div className="network-bg py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((product) => (
              <div key={product._id} className="bg-card border border-border rounded-xl p-4 flex flex-col">
                <Link to={`/product/${product._id}`} className="flex gap-4">
                  <img
                    src={product.images[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-20 h-20 object-contain bg-secondary/30 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-2">{product.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{product.shortDescription}</p>
                    <p className="text-primary font-semibold mt-1">₹{product.price}</p>
                  </div>
                </Link>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => addToCart(product)}>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
