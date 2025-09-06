import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, BookFilters } from "@/types/book";
import { X, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface QuickFiltersProps {
  books: Book[];
  filters: BookFilters;
  onFiltersChange: (filters: BookFilters) => void;
}

export const QuickFilters = ({ books, filters, onFiltersChange }: QuickFiltersProps) => {
  const availableCount = books.filter(book => book.status === "available").length;
  const borrowedCount = books.filter(book => book.status === "borrowed").length;
  const reservedCount = books.filter(book => book.status === "reserved").length;

  const quickFilters = [
    {
      label: "All Books",
      count: books.length,
      icon: null,
      active: filters.status === "all",
      onClick: () => onFiltersChange({ ...filters, status: "all" }),
      color: "bg-card border-border text-card-foreground hover:bg-card-hover"
    },
    {
      label: "Available",
      count: availableCount,
      icon: CheckCircle,
      active: filters.status === "available",
      onClick: () => onFiltersChange({ ...filters, status: "available" }),
      color: "bg-success/10 border-success/20 text-success-foreground hover:bg-success/20"
    },
    {
      label: "Borrowed",
      count: borrowedCount,
      icon: Clock,
      active: filters.status === "borrowed",
      onClick: () => onFiltersChange({ ...filters, status: "borrowed" }),
      color: "bg-warning/10 border-warning/20 text-warning-foreground hover:bg-warning/20"
    },
    {
      label: "Reserved",
      count: reservedCount,
      icon: AlertCircle,
      active: filters.status === "reserved",
      onClick: () => onFiltersChange({ ...filters, status: "reserved" }),
      color: "bg-accent/10 border-accent/20 text-accent-foreground hover:bg-accent/20"
    }
  ];

  const hasActiveFilters = filters.search || filters.genre !== "all" || filters.status !== "all";

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">Quick Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ search: "", genre: "all", status: "all", sortBy: "title" })}
            className="h-7 px-2 text-xs rounded-lg hover:bg-muted"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickFilters.map((filter, index) => (
          <div
            key={index}
            className={`
              relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300
              ${filter.active 
                ? "border-primary bg-primary/10 text-primary shadow-md scale-105" 
                : filter.color
              }
              hover:scale-105 hover:shadow-md
            `}
            onClick={filter.onClick}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  {filter.icon && <filter.icon className="h-3.5 w-3.5" />}
                  <span className="text-xs font-medium">{filter.label}</span>
                </div>
                <p className="text-lg font-bold">{filter.count}</p>
              </div>
            </div>
            
            {filter.active && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-bounce-gentle" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};