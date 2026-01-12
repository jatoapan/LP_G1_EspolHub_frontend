import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import {
  categoryIcons,
  CATEGORIES,
  getFeaturedItems,
  getRecentItems,
  mockItems,
  mockSellers,
} from "@/data/mockData";

// Simulated logged-in user for demo
const currentUser = {
  name: mockSellers[0].name,
  avatar: mockSellers[0].avatar,
};

const Index = () => {
  const featuredItems = getFeaturedItems();
  const recentItems = getRecentItems();

  return (
    <Layout isLoggedIn={true} user={currentUser}>
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
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category];
            const count = mockItems.filter(
              (item) => item.category === category,
            ).length;
            return (
              <CategoryCard
                key={category}
                name={category}
                icon={Icon}
                count={count}
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
            <ProductCard key={item.id} item={item} />
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
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
