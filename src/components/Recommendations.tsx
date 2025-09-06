import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types/book';
import { BookCard } from './BookCard';
import { LoadingSkeleton } from './LoadingSkeleton';

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
    queryFn: fetchNewAdditions 
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">New Additions</h2>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {newAdditions.map(book => (
              <div key={book.id} className="min-w-[200px]">
                <BookCard book={book} onClick={() => {}} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
