import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types/book';
import { BookCard } from '@/components/BookCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { BookDetailModal } from '@/components/BookDetailModal';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MainSidebar } from '@/components/MainSidebar';
import { Recommendations } from '@/components/Recommendations';
import { useMobile } from '@/hooks/use-mobile';
import { MobileSidebar } from '@/components/MobileSidebar';

const fetchBooks = async (searchQuery: string, genre: string | null, status: string | null, language: string | null) => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (genre) params.append('genre', genre);
  if (status) params.append('status', status);
  if (language) params.append('language', language);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/books?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export default function Index() {


  const [serverIp, setServerIp] = useState<string>('Loading...');
    useEffect(() => {
    async function fetchServerIp() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/serverinfo/ip`);
        const data = await response.json();
        if (data.serverIps) {
          setServerIp(data.serverIps.join(', '));
        } else if (data.ip) {
          setServerIp(data.ip);
        }
      } catch (err) {
        console.error('Error fetching server IP:', err);
        setServerIp('Error fetching IP');
      }
    }
    fetchServerIp();
  }, []);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMobile();

  const genre = searchParams.get('genre');
  const status = searchParams.get('status');
  const language = searchParams.get('language');

  const { data: books = [], isLoading: loading } = useQuery<Book[]>({
    queryKey: ['books', searchQuery, genre, status, language],
    queryFn: () => fetchBooks(searchQuery, genre, status, language),
  });

  const hasFilters = useMemo(() => genre || status || language || searchQuery, [genre, status, language, searchQuery]);

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
          <div className="flex items-center gap-4">
            <MobileSidebar />
            <div className="w-full md:w-auto">
              <SearchBar onSearch={setSearchQuery} />
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {loading ? (
            <LoadingSkeleton />
          ) : hasFilters ? (
            Object.keys(groupedBooks).length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold">Buku Tidak Di Temukan</h2>
                <p className="text-muted-foreground mt-2">Gunakan Kata Kunci Lain.</p>
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
        <div className="text-center p-4 text-sm text-muted-foreground text-black dark:text-white font-bold">Server IP: {serverIp}</div>
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

