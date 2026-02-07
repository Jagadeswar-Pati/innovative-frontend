import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Cpu, Zap, CircuitBoard, Layers, Battery, Wifi, Settings, Box, ToggleRight, Monitor, LayoutGrid, Activity, Volume2, Plane, Wrench } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../utils/products';
import { slugify } from '../utils/products';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu, Zap, CircuitBoard, Layers, Battery, Wifi, Settings, Box, ToggleRight, Monitor, LayoutGrid, Activity, Volume2, Plane, Wrench
};

const EShopHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const { categories } = useCategories();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productsApi.getAll();
        if (res.success) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.shortDescription.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, typeof products> = {};
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const categoryNames = Object.keys(productsByCategory);

  const popularCategories = categories.filter((c) => c.slug !== 'all').slice(0, 10);

  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
        {/* Popular Categories */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Popular categories</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-4">
            {popularCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || Box;
              return (
                <Link
                  key={category._id}
                  to={`/eshop/products?category=${category.slug}`}
                  className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-secondary/30 hover:bg-secondary/60 rounded-lg sm:rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-6 sm:mb-8">
          <div className="flex gap-3 sm:gap-6 border-b border-border overflow-x-auto pb-px">
            <button className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">
              Newly Added
            </button>
            <button className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Our Best Selling
            </button>
            <button className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Recommended for you
            </button>
          </div>
        </section>

        {/* Featured Products Grid */}
        <section className="mb-8 sm:mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Products by Category */}
        {categoryNames.map((categoryName) => (
          <section key={categoryName} className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">{categoryName}</h2>
              <Link 
                to={`/eshop/products?category=${slugify(categoryName)}`}
                className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline"
              >
                View All
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
              {productsByCategory[categoryName].slice(0, 5).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ))}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found for "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </EShopLayout>
  );
};

export default EShopHomePage;
