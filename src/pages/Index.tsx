import { useState, useMemo, useEffect } from "react";
import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { AddBookDialog } from "@/components/AddBookDialog";
import { LibraryStats } from "@/components/LibraryStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookDetailModal } from "@/components/BookDetailModal";
import { QuickFilters } from "@/components/QuickFilters";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { mockBooks } from "@/data/mockBooks";
import { Book, BookFilters } from "@/types/book";
import { Library, Grid3X3, LayoutList, Settings, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<BookFilters>({
    search: "",
    genre: "all",
    status: "all",
    sortBy: "title"
  });
  const { toast } = useToast();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setBooks(mockBooks);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            document.getElementById("search-input")?.focus();
            break;
          case "n":
            e.preventDefault();
            // Trigger add book dialog
            break;
          case "g":
            e.preventDefault();
            setViewMode("grid");
            toast({ title: "Switched to grid view" });
            break;
          case "l":
            e.preventDefault();
            setViewMode("list");
            toast({ title: "Switched to list view" });
            break;
          case "t":
            e.preventDefault();
            // Theme toggle is handled by ThemeToggle component
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toast]);

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
    toast({
      title: "Book added successfully! ✨",
      description: `"${book.title}" is now in your library`,
    });
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleStatusChange = (bookId: string, newStatus: Book['status']) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, status: newStatus } : book
    ));
  };

  const handleDeleteBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(prev => prev.filter(book => book.id !== bookId));
    setSelectedBook(null);
    toast({
      title: "Book deleted",
      description: `"${book?.title}" has been removed from your library`,
      variant: "destructive",
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(books, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'library-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: "Library data exported successfully! 📁" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg animate-float">
                  <Library className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">My Library</h1>
                  <p className="text-muted-foreground">Loading your collection...</p>
                </div>
              </div>
            </div>
            <LoadingSkeleton count={8} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg animate-float">
              <Library className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">My Library</h1>
              <p className="text-muted-foreground">Manage your beautiful book collection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <KeyboardShortcuts />
            <ThemeToggle />
            
            <Button
              variant="outline"
              onClick={exportData}
              className="rounded-xl h-10 px-4 border-border/50 hover:border-primary/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

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
        <div className="mb-8 animate-slide-up">
          <LibraryStats books={books} />
        </div>

        {/* Quick Filters */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <QuickFilters books={books} filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <SearchBar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Books Grid */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Books Collection 
              <span className="text-primary font-display ml-2">
                ({filteredBooks.length})
              </span>
            </h2>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 animate-scale-in">
              <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Library className="h-8 w-8 text-muted-foreground animate-bounce-gentle" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground mb-6">
                {filters.search || filters.genre !== "all" || filters.status !== "all" 
                  ? "Try adjusting your search filters or clear them to see all books"
                  : "Your library is waiting for its first book! Start building your collection"
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
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BookCard 
                    book={book} 
                    onClick={() => handleBookClick(book)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book Detail Modal */}
        <BookDetailModal
          book={selectedBook}
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteBook}
        />
      </div>
    </div>
  );
};

export default Index;
