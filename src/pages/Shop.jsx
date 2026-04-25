import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RiFilterLine, RiCloseLine, RiSearchLine, RiGridFill, RiListCheck, RiArrowDownSLine } from 'react-icons/ri';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const priceRanges = [
  { label: 'Under $30', min: 0, max: 30 },
  { label: '$30 – $60', min: 30, max: 60 },
  { label: '$60 – $100', min: 60, max: 100 },
  { label: '$100 – $150', min: 100, max: 150 },
  { label: 'Over $150', min: 150, max: 99999 },
];

const ratings = [5, 4, 3, 2];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridView, setGridView] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    priceRange: null,
    rating: null,
    brand: '',
    featured: searchParams.get('featured') === 'true',
    newArrival: searchParams.get('new') === 'true',
    sort: 'newest',
  });

  const debouncedSearch = useDebounce(filters.search, 400);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [debouncedSearch, filters.category, filters.priceRange, filters.rating, filters.brand, filters.featured, filters.newArrival, filters.sort]);

  useEffect(() => {
    if (page > 1) fetchProducts(page);
  }, [page]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
    const { data: brandData } = await supabase.from('products').select('brand').neq('brand', '');
    const uniqueBrands = [...new Set((brandData || []).map((p) => p.brand))].filter(Boolean).sort();
    setBrands(uniqueBrands);
  };

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    const start = (pageNum - 1) * PAGE_SIZE;

    let query = supabase
      .from('products')
      .select('*, categories(name,slug)', { count: 'exact' });

    if (filters.category) {
      const cat = categories.find((c) => c.slug === filters.category);
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (debouncedSearch) {
      query = query.or(`name.ilike.%${debouncedSearch}%,brand.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
    }
    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange.min).lte('price', filters.priceRange.max);
    }
    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }
    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters.newArrival) {
      query = query.eq('is_new_arrival', true);
    }

    switch (filters.sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'rating': query = query.order('rating', { ascending: false }); break;
      case 'popular': query = query.order('review_count', { ascending: false }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    query = query.range(start, start + PAGE_SIZE - 1);

    const { data, count } = await query;

    if (pageNum === 1) {
      setProducts(data || []);
    } else {
      setProducts((prev) => [...prev, ...(data || [])]);
    }
    setTotal(count || 0);
    setLoading(false);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', priceRange: null, rating: null, brand: '', featured: false, newArrival: false, sort: 'newest' });
    setSearchParams({});
  };

  const hasActiveFilters = filters.category || filters.priceRange || filters.rating || filters.brand || filters.featured || filters.newArrival;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Search</label>
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat.slug ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Price Range</label>
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => updateFilter('priceRange', filters.priceRange?.label === range.label ? null : range)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.priceRange?.label === range.label ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Minimum Rating</label>
        <div className="space-y-1">
          {ratings.map((r) => (
            <button
              key={r}
              onClick={() => updateFilter('rating', filters.rating === r ? null : r)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${filters.rating === r ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
            >
              {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Brand</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => updateFilter('brand', filters.brand === brand ? '' : brand)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.brand === brand ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" fullWidth onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-1">
            {filters.category ? categories.find((c) => c.slug === filters.category)?.name || 'Shop' : 'All Products'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {total} {total === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-card sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-neutral-800 dark:text-white">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-rose-500 hover:text-rose-600">
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-rose-400 transition-colors"
              >
                <RiFilterLine size={16} />
                Filters
                {hasActiveFilters && <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{[filters.category, filters.priceRange, filters.rating, filters.brand].filter(Boolean).length}</span>}
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <button onClick={() => setGridView(true)} className={`p-2 rounded-lg transition-colors ${gridView ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'}`}>
                  <RiGridFill size={18} />
                </button>
                <button onClick={() => setGridView(false)} className={`p-2 rounded-lg transition-colors ${!gridView ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'}`}>
                  <RiListCheck size={18} />
                </button>
              </div>

              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <RiArrowDownSLine className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Products */}
            {loading && products.length === 0 ? (
              <div className={`grid gap-4 ${gridView ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl aspect-[4/5] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RiSearchLine size={28} className="text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No products found</h3>
                <p className="text-neutral-400 text-sm mb-5">Try adjusting your filters or search query.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 md:gap-5 ${gridView ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Load more */}
                {products.length < total && (
                  <div className="mt-10 text-center">
                    <Button
                      variant="secondary"
                      loading={loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Load More ({total - products.length} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-900 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-semibold text-neutral-800 dark:text-white">Filters</h2>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                <RiCloseLine size={20} />
              </button>
            </div>
            <div className="p-5">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
