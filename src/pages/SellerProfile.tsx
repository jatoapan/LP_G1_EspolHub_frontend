import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ProductCard';
import { getSellerById, getItemsBySeller, mockSellers } from '@/data/mockData';
import { CheckCircle } from 'lucide-react';

const currentUser = {
  name: mockSellers[0].name,
  avatar: mockSellers[0].avatar,
};

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const seller = getSellerById(Number(id));
  const items = seller ? getItemsBySeller(seller.id).filter(i => i.status !== 'sold') : [];

  if (!seller) {
    return (
      <Layout isLoggedIn={true} user={currentUser}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Vendedor no encontrado</h1>
          <Button asChild>
            <Link to="/explore">Volver a explorar</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const joinDate = new Date(seller.joinedDate).toLocaleDateString('es-EC', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <Layout isLoggedIn={true} user={currentUser}>
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
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {seller.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{seller.name}</h1>
                {seller.isVerified && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground mb-4">
                <Badge variant="secondary">{seller.faculty}</Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Miembro desde {joinDate}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {items.length} anuncio{items.length !== 1 ? 's' : ''} activo{items.length !== 1 ? 's' : ''}
                </div>
              </div>

              {seller.isVerified && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Estudiante Verificado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Seller's Items */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Anuncios de {seller.name}</h2>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => (
                <ProductCard key={item.id} item={item} />
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
