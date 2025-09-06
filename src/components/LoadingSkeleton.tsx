import { Book } from "@/types/book";

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton = ({ count = 8 }: LoadingSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden">
            {/* Cover placeholder */}
            <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 relative">
              <div className="absolute top-3 right-3 w-16 h-6 bg-muted-foreground/20 rounded-lg" />
              <div className="absolute bottom-3 left-3 w-12 h-6 bg-muted-foreground/20 rounded-lg" />
            </div>
            
            {/* Content placeholder */}
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="h-3 bg-muted-foreground/20 rounded w-1/3" />
                <div className="h-3 bg-muted-foreground/20 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const BookCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden">
      <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 animate-shimmer bg-[length:200%_100%]" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-shimmer bg-[length:200%_100%]" />
          <div className="h-3 bg-muted rounded w-2/3 animate-shimmer bg-[length:200%_100%]" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-muted rounded w-1/3 animate-shimmer bg-[length:200%_100%]" />
          <div className="h-3 bg-muted rounded w-1/4 animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  </div>
);