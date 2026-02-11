import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronDown, Grid3X3, List } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import ProductCard from '../components/ProductCard';
import { ProductSkeletonGrid } from '../components/ProductSkeleton';
import { productsApi } from '../services/api';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../utils/products';
import { slugify } from '../utils/products';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

const ProductListingPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useCategories();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.getAll();
        if (res.success) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [searchParam, searchQuery]);

  const normalizeSlug = (value: string) => slugify(value || '').replace(/-+/g, '-');
  const singularizeSlug = (value: string) => (value.endsWith('s') ? value.slice(0, -1) : value);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (categoryParam && categoryParam !== 'all') {
      const normalizedParam = normalizeSlug(categoryParam);
      const paramSingular = singularizeSlug(normalizedParam);
      result = result.filter((p) => {
        const categorySlug = normalizeSlug(p.category || '');
        const subcategorySlug = normalizeSlug(p.subcategory || '');
        if (categorySlug === normalizedParam || subcategorySlug === normalizedParam) return true;
        if (paramSingular !== normalizedParam) {
          return categorySlug === paramSingular || subcategorySlug === paramSingular;
        }
        const categorySingular = singularizeSlug(categorySlug);
        const subcategorySingular = singularizeSlug(subcategorySlug);
        return categorySingular === normalizedParam || subcategorySingular === normalizedParam;
      });
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.subcategory.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, categoryParam, searchQuery, sortBy]);

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest First',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    name: 'Name: A to Z'
  };

  const currentCategory = categories.find(c => c.slug === categoryParam)?.name || 'All Products';

  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto">
          <Link to="/" className="hover:text-foreground whitespace-nowrap">Home</Link>
          <span>/</span>
          <Link to="/eshop" className="hover:text-foreground whitespace-nowrap">E-Shop</Link>
          <span>/</span>
          <span className="text-foreground whitespace-nowrap">{currentCategory}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{currentCategory}</h1>
            <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading…' : `${filteredAndSortedProducts.length} products found`}
          </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <DropdownMenuItem 
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={sortBy === option ? 'bg-secondary' : ''}
                  >
                    {sortLabels[option]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle - touch-friendly */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-3 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
              >
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-3 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={category.slug === 'all' ? '/eshop/products' : `/eshop/products?category=${category.slug}`}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-colors ${
                categoryParam === category.slug || (!categoryParam && category.slug === 'all')
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductSkeletonGrid
            count={8}
            gridClass={
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                : 'grid-cols-1'
            }
          />
        ) : !isLoading && filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found</p>
            <Link to="/eshop/products" className="mt-4 text-primary hover:underline inline-block">
              View all products
            </Link>
          </div>
        ) : (
          <div
            className={`grid gap-2 sm:gap-4 product-content-enter ${
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                : 'grid-cols-1'
            }`}
          >
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </EShopLayout>
  );
};

export default ProductListingPage;
