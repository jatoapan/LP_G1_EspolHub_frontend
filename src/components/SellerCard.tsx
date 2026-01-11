import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Seller } from '@/data/mockData';

interface SellerCardProps {
  seller: Seller;
  phone?: string;
  showContact?: boolean;
}

export const SellerCard = ({ seller, phone, showContact = true }: SellerCardProps) => {
  const handleWhatsAppClick = () => {
    if (phone) {
      const message = encodeURIComponent("¡Hola! Vi tu anuncio en EspolHub y me interesa.");
      window.open(`https://wa.me/593${phone.slice(1)}?text=${message}`, '_blank');
    }
  };

  const joinedYear = new Date(seller.joinedDate).getFullYear();

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link to={`/seller/${seller.id}`}>
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {seller.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                to={`/seller/${seller.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                {seller.name}
              </Link>
              {seller.isVerified && (
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {seller.faculty}
              </Badge>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                Desde {joinedYear}
              </div>
            </div>

            {showContact && phone && (
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" />
                Contactar por WhatsApp
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
