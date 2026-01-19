import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,

  Share2,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Layout } from "@/components/layout/Layout";
import { SellerCard } from "@/components/SellerCard";
import { ProductCard } from "@/components/ProductCard";
import { CONDITIONS, CONDITION_COLORS } from "@/types/enums";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAnnouncement } from "@/api/announcements";
import { getSellerAnnouncements, getPublicProfile } from "@/api/sellers";
import { useAuth } from "@/contexts/AuthContext";
import { Announcement } from "@/types";
import { getImageUrl } from "@/utils/imageUrl";
import { getMockAnnouncementById, getMockAnnouncementsBySeller } from "@/data/mockData";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [sellerAnnouncements, setSellerAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = user ? {
    name: user.attributes.name,
    avatar: undefined,
  } : undefined;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getAnnouncement(Number(id));
        
        // If seller data is incomplete, fetch full profile
        if (data.relationships?.seller?.data?.id && !data.relationships.seller.data.attributes) {
          const sellerId = parseInt(data.relationships.seller.data.id);
          const sellerProfile = await getPublicProfile(sellerId);
          // Merge seller profile into announcement
          data.relationships.seller.data = sellerProfile;
        }
        
        setAnnouncement(data);
        
        // Get seller's other announcements
        if (data.relationships?.seller?.data?.id) {
          const sellerId = parseInt(data.relationships.seller.data.id);
          const sellerItems = await getSellerAnnouncements(sellerId);
          setSellerAnnouncements(sellerItems.filter(item => item.id !== data.id).slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching announcement, using mock data:", error);
        // Fallback to mock data
        const mockData = getMockAnnouncementById(id);
        if (mockData) {
          setAnnouncement(mockData);
          const sellerId = mockData.relationships?.seller?.data?.id;
          if (sellerId) {
            const mockSellerItems = getMockAnnouncementsBySeller(sellerId)
              .filter(item => item.id !== id)
              .slice(0, 4);
            setSellerAnnouncements(mockSellerItems);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout isLoggedIn={isAuthenticated} user={currentUser}>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </Layout>
    );
  }

  if (!announcement) {
    return (
      <Layout isLoggedIn={isAuthenticated} user={currentUser}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button asChild>
            <Link to="/explore">Volver a explorar</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const { attributes, relationships } = announcement;
  const seller = relationships?.seller?.data;
  const categoryName = relationships?.category?.data?.attributes?.name || "Categoría";
  const price = typeof attributes.price === 'string' ? parseFloat(attributes.price) : attributes.price;
  const conditionLabel = CONDITIONS[attributes.condition];
  const conditionColor = CONDITION_COLORS[attributes.condition];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: attributes.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };



  const imagesLength = attributes.images?.length || 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagesLength);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imagesLength) % imagesLength,
    );
  };

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      <div className="container py-6">
        {/* Back Button */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Inicio
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/explore">Explorar</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* Renderizar categoría solo si existe */}
            {categoryName && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    {/* Linkea a explorar pre-filtrado por esta categoría */}
                    <Link to={`/explore?category=${encodeURIComponent(categoryName)}`}>
                      {categoryName}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}

            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary truncate max-w-[200px] md:max-w-none">
                {attributes.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={getImageUrl(attributes.images?.[currentImageIndex])}
                alt={attributes.title}
                className="h-full w-full object-cover"
              />

              {(attributes.images?.length || 0) > 1 && (
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
              {attributes.status === "reserved" && (
                <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground">
                  Reservado
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {(attributes.images?.length || 0) > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attributes.images?.map((img, idx) => (
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
                      src={getImageUrl(img)}
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
                  {attributes.title}
                </h1>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${price.toFixed(2)}
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
                  <Eye className="h-4 w-4" />
                  {attributes.views_count} vistas
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(attributes.created_at).toLocaleDateString("es-EC", {
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
                {attributes.description}
              </p>
            </div>

            <Separator />

            {/* Seller Card */}
            {seller && (
              <div>
                <h2 className="font-semibold mb-3">Vendedor</h2>
                <SellerCard seller={seller} />
              </div>
            )}
          </div>
        </div>

        {/* More from Seller */}
        {sellerAnnouncements.length > 0 && seller?.attributes && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Más de {seller.attributes.name}</h2>
              <Link
                to={`/seller/${seller.id}`}
                className="text-sm text-primary hover:underline"
              >
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sellerAnnouncements.map((item) => (
                <ProductCard key={item.id} announcement={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
