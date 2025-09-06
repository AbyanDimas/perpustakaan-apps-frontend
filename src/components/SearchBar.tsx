import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookFilters } from "@/types/book";

interface SearchBarProps {
  filters: BookFilters;
  onFiltersChange: (filters: BookFilters) => void;
}

const genres = [
  "All Genres",
  "Fiction", 
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Biography",
  "History",
  "Technology",
  "Self-Help"
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "borrowed", label: "Borrowed" },
  { value: "reserved", label: "Reserved" }
];

const sortOptions = [
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "rating", label: "Rating" },
  { value: "addedDate", label: "Date Added" }
];

export const SearchBar = ({ filters, onFiltersChange }: SearchBarProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books, authors, or ISBN..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 h-12 rounded-xl border-input-border bg-input focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select 
            value={filters.genre} 
            onValueChange={(value) => onFiltersChange({ ...filters, genre: value })}
          >
            <SelectTrigger className="w-40 h-12 rounded-xl border-input-border bg-input">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre === "All Genres" ? "all" : genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.status} 
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-36 h-12 rounded-xl border-input-border bg-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as BookFilters['sortBy'] })}
          >
            <SelectTrigger className="w-36 h-12 rounded-xl border-input-border bg-input">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};