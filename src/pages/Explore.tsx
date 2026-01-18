import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CONDITIONS, SORT_OPTIONS, ConditionKey } from '@/types/enums';
import { searchAnnouncements } from '@/api/announcements';
import { getCategories } from '@/api/categories';
import { useAuth } from '@/contexts/AuthContext';
import { Announcement, Category } from '@/types';
import { mockCategories, mockAnnouncements } from '@/data/mockData';

const Explore = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filters (single selection for category and condition - backend limitation)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ConditionKey | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(1000); // Default, se actualiza dinámicamente
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const isInitialized = useRef(false);

  const currentUser = user ? {
    name: user.attributes.name,
    avatar: undefined,
  } : undefined;

  // 1. Fetch categories and max price on mount (in parallel)
  useEffect(() => {
    // Fetch categories
    getCategories()
      .then(setCategories)
      .catch(err => {
        console.error('Error fetching categories, using mock data:', err);
        setCategories(mockCategories);
      });
    
    // Fetch max price (get the most expensive product)
    searchAnnouncements({ sort: 'price_desc', per_page: 1 })
      .then(res => {
        if (res.data.length > 0) {
          const highest = Number(res.data[0].attributes.price) || 1000;
          // Round up to nearest 100
          const newMax = Math.ceil(highest / 100) * 100 || 1000;
          setMaxPrice(newMax);
          setPriceRange([0, newMax]); // Update slider range
        }
      })
      .catch(err => {
        console.error('Error fetching max price:', err);
        // Use mock data max price as fallback
        const mockMax = Math.max(...mockAnnouncements.map(a => Number(a.attributes.price)));
        const newMax = Math.ceil(mockMax / 100) * 100 || 1000;
        setMaxPrice(newMax);
        setPriceRange([0, newMax]);
      });
  }, []);

  // 2. Initialize filters from URL once categories are loaded
  useEffect(() => {
    if (categories.length === 0) return;
    
    const urlQuery = searchParams.get('q') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlCondition = searchParams.get('condition') || '';
    const urlSort = searchParams.get('sort') || 'recent';
    
    if (!isInitialized.current) {
      // First time: initialize from URL
      isInitialized.current = true;
      setSearchQuery(urlQuery);
      if (urlCategory) setSelectedCategory(urlCategory);
      if (urlCondition) setSelectedCondition(urlCondition as ConditionKey);
      setSortBy(urlSort);
    }
  }, [categories]);

  // 2b. Sync search query when URL changes externally (nav search)
  const urlQuery = searchParams.get('q') || '';
  const lastUrlQuery = useRef(urlQuery);
  
  useEffect(() => {
    if (!isInitialized.current) return;
    // Only sync if URL query actually changed (not from our own setSearchParams)
    if (urlQuery !== lastUrlQuery.current) {
      lastUrlQuery.current = urlQuery;
      setSearchQuery(urlQuery);
    }
  }, [urlQuery]);

  // 3. Update URL when filters change (after initialization)
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCondition) params.set('condition', selectedCondition);
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < maxPrice) params.set('max_price', priceRange[1].toString());
    if (sortBy && sortBy !== 'recent') params.set('sort', sortBy);
    
    // Update ref to prevent loop
    lastUrlQuery.current = searchQuery;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedCondition, priceRange, maxPrice, sortBy, setSearchParams]);

  // 4. Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCondition, priceRange, sortBy]);

  // 5. Fetch announcements whenever filters OR page changes
  useEffect(() => {
    // Skip if categories haven't loaded yet
    if (categories.length === 0) return;
    
    const controller = new AbortController();
    
    const doFetch = async () => {
      setLoading(true);
      
      // Find category ID from name
      let categoryId: number | undefined;
      if (selectedCategory) {
        const cat = categories.find(c => c.attributes.name === selectedCategory);
        if (cat) categoryId = parseInt(cat.id);
      }
      
      const params = {
        q: searchQuery || undefined,
        category_id: categoryId,
        condition: selectedCondition || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
        max_price: priceRange[1] < maxPrice ? priceRange[1] : undefined,
        sort: sortBy,
        page: currentPage,
        per_page: 12,
      };
      
      try {
        const result = await searchAnnouncements(params);
        if (!controller.signal.aborted) {
          setAnnouncements(result.data);
          setTotalPages(result.meta?.total_pages || 1);
          setTotalCount(result.meta?.total_count || result.data.length);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching announcements, using mock data:', error);
          // Fallback to mock data with basic filtering
          let filtered = [...mockAnnouncements];
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(a => 
              a.attributes.title.toLowerCase().includes(q) ||
              a.attributes.description.toLowerCase().includes(q)
            );
          }
          if (selectedCategory) {
            filtered = filtered.filter(a => 
              a.relationships?.category?.data?.attributes?.name === selectedCategory
            );
          }
          if (selectedCondition) {
            filtered = filtered.filter(a => a.attributes.condition === selectedCondition);
          }
          filtered = filtered.filter(a => {
            const price = Number(a.attributes.price);
            return price >= priceRange[0] && price <= priceRange[1];
          });
          setAnnouncements(filtered);
          setTotalPages(1);
          setTotalCount(filtered.length);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Debounce the fetch
    const timer = setTimeout(doFetch, 300);
    
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, selectedCondition, priceRange, sortBy, categories, maxPrice, currentPage]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCondition(null);
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedCondition ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // Filter handlers - single selection (backend only supports one value)
  const handleCategoryChange = (categoryName: string) => {
    // Toggle: if same category clicked, deselect; otherwise select new one
    setSelectedCategory(prev => prev === categoryName ? null : categoryName);
  };

  const handleConditionChange = (condition: ConditionKey) => {
    // Toggle: if same condition clicked, deselect; otherwise select new one
    setSelectedCondition(prev => prev === condition ? null : condition);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value as [number, number]);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categorías</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map(category => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategory === category.attributes.name}
                onCheckedChange={() => handleCategoryChange(category.attributes.name)}
              />
              <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                {category.attributes.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Condition */}
      <div>
        <h3 className="font-medium mb-3">Condición</h3>
        <div className="space-y-2">
          {Object.entries(CONDITIONS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`cond-${key}`}
                checked={selectedCondition === key}
                onCheckedChange={() => handleConditionChange(key as ConditionKey)}
              />
              <Label htmlFor={`cond-${key}`} className="text-sm cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Rango de Precio</h3>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={maxPrice}
          step={5}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <Separator />

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      <div className="container py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Explorar</h1>
            <p className="text-muted-foreground">
              {totalCount} producto{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] hidden md:flex bg-card">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-card">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(selectedCategory)} />
              </Badge>
            )}
            {selectedCondition && (
              <Badge variant="secondary" className="gap-1">
                {CONDITIONS[selectedCondition]}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleConditionChange(selectedCondition)} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
              Limpiar todo
            </Button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-lg border border-border p-4">
              <h2 className="font-semibold mb-4">Filtros</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : announcements.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {announcements.map((item) => (
                    <ProductCard key={item.id} announcement={item} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No se encontraron productos</p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
