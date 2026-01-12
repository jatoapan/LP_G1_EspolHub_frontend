import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count?: number;
  className?: string;
}

export const CategoryCard = ({ name, icon: Icon, count, className }: CategoryCardProps) => {
  return (
    <Link
      to={`/explore?category=${encodeURIComponent(name)}`}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 group min-w-[100px]",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-center text-foreground group-hover:text-primary transition-colors">
        {name}
      </span>
      {count !== undefined && (
        <span className="text-[10px] text-muted-foreground">
          {count} artículos
        </span>
      )}
    </Link>
  );
};
