import { useState, useMemo } from "react";
import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { AddBookDialog } from "@/components/AddBookDialog";
import { LibraryStats } from "@/components/LibraryStats";
import { mockBooks } from "@/data/mockBooks";
import { Book, BookFilters } from "@/types/book";
import { Library, Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<BookFilters>({
    search: "",
    genre: "all",
    status: "all",
    sortBy: "title"
  });
  const { toast } = useToast();

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = filters.search === "" || 
        book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.search.toLowerCase()) ||
        book.isbn.includes(filters.search);
      
      const matchesGenre = filters.genre === "all" || book.genre === filters.genre;
      const matchesStatus = filters.status === "all" || book.status === filters.status;
      
      return matchesSearch && matchesGenre && matchesStatus;
    });

    // Sort books
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "rating":
          return b.rating - a.rating;
        case "addedDate":
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [books, filters]);

  const handleAddBook = (newBook: Omit<Book, 'id'>) => {
    const book: Book = {
      ...newBook,
      id: Date.now().toString()
    };
    setBooks(prev => [book, ...prev]);
  };

  const handleBookClick = (book: Book) => {
    toast({
      title: book.title,
      description: `By ${book.author} - ${book.status.charAt(0).toUpperCase() + book.status.slice(1)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg">
              <Library className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Library</h1>
              <p className="text-muted-foreground">Manage your book collection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-card rounded-xl p-1 shadow-sm border border-border/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-lg h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-lg h-8 px-3"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
            <AddBookDialog onAddBook={handleAddBook} />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <LibraryStats books={books} />
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchBar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Books Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Books Collection ({filteredBooks.length})
            </h2>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Library className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground mb-6">
                {filters.search || filters.genre !== "all" || filters.status !== "all" 
                  ? "Try adjusting your search filters"
                  : "Start by adding your first book to the library"
                }
              </p>
              {(!filters.search && filters.genre === "all" && filters.status === "all") && (
                <AddBookDialog onAddBook={handleAddBook} />
              )}
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" 
                : "grid-cols-1"
            }`}>
              {filteredBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
