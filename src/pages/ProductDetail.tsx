import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/Layout";
import { SellerCard } from "@/components/SellerCard";
import { ProductCard } from "@/components/ProductCard";
import {
  getItemById,
  getSellerById,
  getItemsBySeller,
  CONDITIONS,
  CONDITION_COLORS,
  mockSellers,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const currentUser = {
  name: mockSellers[0].name,
  avatar: mockSellers[0].avatar,
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const item = getItemById(Number(id));
  const seller = item ? getSellerById(item.sellerId) : undefined;
  const sellerItems = seller
    ? getItemsBySeller(seller.id)
        .filter((i) => i.id !== item?.id)
        .slice(0, 4)
    : [];

  // Simulate view increment on mount
  useEffect(() => {
    if (item) {
      // In real app: PATCH /api/items/:id/increment_views
      console.log(`Incrementing views for item ${item.id}`);
    }
  }, [item?.id]);

  if (!item || !seller) {
    return (
      <Layout isLoggedIn={true} user={currentUser}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button asChild>
            <Link to="/explore">Volver a explorar</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const conditionLabel = CONDITIONS[item.condition];
  const conditionColor = CONDITION_COLORS[item.condition];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + item.images.length) % item.images.length,
    );
  };

  return (
    <Layout isLoggedIn={true} user={currentUser}>
      <div className="container py-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link to="/explore">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="h-full w-full object-cover"
              />

              {item.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur hover:bg-card shadow-md"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur hover:bg-card shadow-md"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Status Badge */}
              {item.status === "reserved" && (
                <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground">
                  Reservado
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      currentImageIndex === idx
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {item.title}
                </h1>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFavorite}
                    className={cn(
                      isFavorite && "text-destructive border-destructive",
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4", isFavorite && "fill-current")}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${item.price.toFixed(2)}
                </span>
                <Badge
                  variant="outline"
                  className={cn("border", conditionColor)}
                >
                  {conditionLabel}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {item.views} vistas
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(item.createdAt).toLocaleDateString("es-EC", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            <Separator />

            {/* Seller Card */}
            <div>
              <h2 className="font-semibold mb-3">Vendedor</h2>
              <SellerCard seller={seller} phone={seller.phone} />
            </div>
          </div>
        </div>

        {/* More from Seller */}
        {sellerItems.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Más de {seller.name}</h2>
              <Link
                to={`/seller/${seller.id}`}
                className="text-sm text-primary hover:underline"
              >
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sellerItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
