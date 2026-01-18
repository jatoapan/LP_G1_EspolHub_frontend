import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicProfile, getSellerAnnouncements } from '@/api/sellers';
import { PublicSeller, Announcement } from '@/types';
import { getMockSellerById, getMockAnnouncementsBySeller } from '@/data/mockData';

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState<PublicSeller | null>(null);
  const [items, setItems] = useState<Announcement[]>([]);
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
        const [sellerData, announcementsData] = await Promise.all([
          getPublicProfile(Number(id)),
          getSellerAnnouncements(Number(id)),
        ]);
        setSeller(sellerData);
        setItems(announcementsData.filter(i => i.attributes.status !== 'sold'));
      } catch (error) {
        console.error('Error fetching seller data, using mock data:', error);
        // Fallback to mock data
        const mockSeller = getMockSellerById(id);
        if (mockSeller) {
          setSeller(mockSeller as unknown as PublicSeller);
          const mockItems = getMockAnnouncementsBySeller(id)
            .filter(i => i.attributes.status !== 'sold');
          setItems(mockItems);
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

  if (!seller) {
    return (
      <Layout isLoggedIn={isAuthenticated} user={currentUser}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Vendedor no encontrado</h1>
          <Button asChild>
            <Link to="/explore">Volver a explorar</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      <div className="container py-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/explore">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>

        {/* Seller Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {seller.attributes.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{seller.attributes.name}</h1>
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground mb-4">
                <Badge variant="secondary">{seller.attributes.faculty}</Badge>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {items.length} anuncio{items.length !== 1 ? 's' : ''} activo{items.length !== 1 ? 's' : ''}
                </div>
              </div>

              <Badge className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Estudiante Verificado
              </Badge>
            </div>
          </div>
        </div>

        {/* Seller's Items */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Anuncios de {seller.attributes.name}</h2>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => (
                <ProductCard key={item.id} announcement={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary/50 rounded-xl">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tiene anuncios activos</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default SellerProfile;
