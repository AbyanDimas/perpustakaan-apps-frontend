import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types/book';
import { BookCard } from './BookCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { BookDetailModal } from './BookDetailModal';

const fetchNewAdditions = async (): Promise<Book[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/books?sort=createdAt&order=desc&limit=10`);
  if (!response.ok) {
    throw new Error('Failed to fetch new additions');
  }
  return response.json();
};

export function Recommendations() {
  const { data: newAdditions = [], isLoading } = useQuery<Book[]>({
    queryKey: ['new-additions'],
    queryFn: fetchNewAdditions,
  });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Koleksi Terbaru</h2>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {newAdditions.map((book) => (
              <div key={book.id} className="min-w-[200px]">
                <BookCard book={book} onClick={() => setSelectedBook(book)} />
              </div>
            ))}
          </div>
        )}
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
