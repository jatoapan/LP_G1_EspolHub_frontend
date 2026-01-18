import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Announcement } from "@/types";
import { CONDITIONS, CONDITION_COLORS } from "@/types/enums";
import { getImageUrl } from "@/utils/imageUrl";

interface ProductCardProps {
  announcement: Announcement;
  className?: string;
}

export const ProductCard = ({ announcement, className }: ProductCardProps) => {
  const { attributes } = announcement;
  const conditionLabel = CONDITIONS[attributes.condition];
  const conditionColor = CONDITION_COLORS[attributes.condition];
  const price = typeof attributes.price === 'string' ? parseFloat(attributes.price) : attributes.price;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg",
        className,
      )}
    >
      <Link to={`/product/${announcement.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={getImageUrl(attributes.images?.[0])}
            alt={attributes.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Status Badge */}
          {attributes.status === "reserved" && (
            <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground border-none">
              Reservado
            </Badge>
          )}
          {attributes.status === "sold" && (
            <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground border-none">
              Vendido
            </Badge>
          )}


        </div>

        {/* Content */}
        <CardContent className="p-3">
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-lg font-bold text-foreground">
              ${price.toFixed(2)}
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
            {attributes.title}
          </h3>

          {/* Views */}
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{attributes.views_count}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
