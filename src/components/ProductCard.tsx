import { Link } from "react-router-dom";
import { Heart, Eye, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Item,
  CONDITIONS,
  CONDITION_COLORS,
  getSellerById,
} from "@/data/mockData";

interface ProductCardProps {
  item: Item;
  className?: string;
}

export const ProductCard = ({ item, className }: ProductCardProps) => {
  const seller = getSellerById(item.sellerId);
  const conditionLabel = CONDITIONS[item.condition];
  const conditionColor = CONDITION_COLORS[item.condition];

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg",
        className,
      )}
    >
      <Link to={`/product/${item.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Status Badge */}
          {item.status === "reserved" && (
            <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground border-none">
              Reservado
            </Badge>
          )}
          {item.status === "sold" && (
            <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground border-none">
              Vendido
            </Badge>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur hover:bg-card shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Handle favorite
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-3">
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-lg font-bold text-foreground">
              ${item.price.toFixed(2)}
            </span>
            <Badge
              variant="outline"
              className={cn("text-[10px] border", conditionColor)}
            >
              {conditionLabel}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Location & Views */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{item.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{item.views}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
