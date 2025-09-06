import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Book } from '@/types/book';
import { BookCard } from '@/components/BookCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { BookDetailModal } from '@/components/BookDetailModal';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MainSidebar } from '@/components/MainSidebar';
import { Recommendations } from '@/components/Recommendations';

export default function Index() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const genre = searchParams.get('genre');
  const status = searchParams.get('status');
  const language = searchParams.get('language');

  const hasFilters = useMemo(() => genre || status || language || searchQuery, [genre, status, language, searchQuery]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (genre) params.append('genre', genre);
        if (status) params.append('status', status);
        if (language) params.append('language', language);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/books?${params.toString()}`);
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, genre, status, language]);

  const groupedBooks = useMemo(() => {
    if (genre) {
      return { [genre]: books };
    }
    return books.reduce((acc, book) => {
      const bookGenre = book.genre || 'Other';
      if (!acc[bookGenre]) {
        acc[bookGenre] = [];
      }
      acc[bookGenre].push(book);
      return acc;
    }, {} as Record<string, Book[]>);
  }, [books, genre]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <MainSidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="w-full md:w-1/2">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <LoadingSkeleton />
          ) : hasFilters ? (
            Object.keys(groupedBooks).length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold">No books found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedBooks).map(([genre, booksOnShelf]) => (
                  <div key={genre}>
                    <h2 className="text-2xl font-bold mb-4 capitalize">{genre}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {booksOnShelf.map(book => (
                        <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
                      ))}
                    </div>
                    <div className="h-4 bg-yellow-700/30 dark:bg-yellow-900/50 mt-2 rounded-md shadow-inner" style={{ backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}></div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <Recommendations />
          )}
        </main>
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          open={!!selectedBook}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBook(null);
            }
          }}
        />
      )}
    </div>
  );
}