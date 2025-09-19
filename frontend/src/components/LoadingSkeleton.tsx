import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-12">
      {[...Array(2)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, j) => (
              <div key={j}>
                <Skeleton className="h-auto aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </div>
            ))}
          </div>
          <Skeleton className="h-4 mt-2 rounded-md" />
        </div>
      ))}
    </div>
  );
};
