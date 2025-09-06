import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Star, User, Calendar, BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

const statusColors = {
  available: "bg-success text-success-foreground",
  borrowed: "bg-warning text-warning-foreground", 
  reserved: "bg-accent text-accent-foreground"
};

const statusLabels = {
  available: "Available",
  borrowed: "Borrowed",
  reserved: "Reserved"
};

export const BookCard = ({ book, onClick }: BookCardProps) => {
  return (
    <div 
      className="group bg-gradient-card rounded-2xl shadow-book hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-border/50 hover:border-primary/20 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Book Cover */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-muted">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className={`${statusColors[book.status]} shadow-sm`}>
            {statusLabels[book.status]}
          </Badge>
        </div>
        
        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="text-xs font-medium">{book.rating}</span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <User className="h-3 w-3" />
            <p className="text-sm truncate">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{book.genre}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{book.publishedYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};