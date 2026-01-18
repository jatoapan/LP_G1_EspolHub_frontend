import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { 
  categoryIcons, 
  mockCategories, 
  getMockPopularAnnouncements, 
  getMockRecentAnnouncements 
} from "@/data/mockData";
import { getPopularAnnouncements, getRecentAnnouncements } from "@/api/announcements";
import { getCategories } from "@/api/categories";
import { useAuth } from "@/contexts/AuthContext";
import { Announcement, Category } from "@/types";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Announcement[]>([]);
  const [recentItems, setRecentItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, popularData, recentData] = await Promise.all([
          getCategories(),
          getPopularAnnouncements({ per_page: 4 }),
          getRecentAnnouncements({ per_page: 4 }),
        ]);
        setCategories(categoriesData);
        setFeaturedItems(popularData.data);
        setRecentItems(recentData.data);
      } catch (error) {
        console.error("Error fetching data, using mock data:", error);
        // Fallback to mock data
        setCategories(mockCategories);
        setFeaturedItems(getMockPopularAnnouncements());
        setRecentItems(getMockRecentAnnouncements().slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentUser = user ? {
    name: user.attributes.name,
    avatar: undefined,
  } : undefined;

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="container py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Compra y vende en <span className="text-primary">ESPOL</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              El marketplace exclusivo para estudiantes politécnicos. Encuentra
              libros, electrónica, servicios y más.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="gap-2 shadow-primary hover:shadow-lg transition-all"
              >
                <Link to="/explore">
                  <Sparkles className="h-5 w-5" />
                  Explorar Productos
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/publish">
                  Publicar Anuncio
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Categories */}
      <section className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Categorías</h2>
          <Link to="/explore" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 lg:grid-cols-10 md:overflow-visible">
          {categories.map((category) => {
            const Icon = categoryIcons[category.attributes.name] || categoryIcons["Otros"];
            return (
              <CategoryCard
                key={category.id}
                name={category.attributes.name}
                icon={Icon}
                count={category.attributes.announcements_count}
                className="flex-shrink-0"
              />
            );
          })}
        </div>
      </section>

      {/* Featured Items */}
      <section className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Destacados
            </h2>
          </div>
          <Link
            to="/explore?sort=popular"
            className="text-sm text-primary hover:underline"
          >
            Ver más
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredItems.map((item) => (
            <ProductCard key={item.id} announcement={item} />
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section className="container py-10 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Recién Publicados
          </h2>
          <Link
            to="/explore?sort=recent"
            className="text-sm text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentItems.map((item) => (
            <ProductCard key={item.id} announcement={item} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
