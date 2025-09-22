import { Book } from '@/types/book';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

const logBookClick = async (book: Book) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'VIEW_BOOK', details: `User viewed book: ${book.title}` }),
    });
  } catch (error) {
    console.error('Failed to log book click:', error);
  }
};

export function BookCard({ book, onClick }: BookCardProps) {
  const handleClick = () => {
    logBookClick(book);
    onClick();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <Card className="overflow-hidden transition-all duration-300 ease-in-out border rounded-lg shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
        <CardContent className="p-0">
          <img
            src={book.coverPath ? `${import.meta.env.VITE_API_URL}/${book.coverPath}` : './placeholder.svg'}
            alt={book.title}
            className="object-cover w-full h-auto rounded-t-lg aspect-[2/3]"
          />
        </CardContent>
      </Card>
      <div className="pt-3 px-1 w-full">
        <h3 className="font-semibold truncate text-md group-hover:text-primary" title={book.title}>{book.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{book.author}</p>
      </div>
    </motion.div>
  );
}