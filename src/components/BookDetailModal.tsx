import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { Star, User, Calendar, BookOpen, Hash, Globe, FileText, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (bookId: string, newStatus: Book['status']) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
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

export const BookDetailModal = ({ 
  book, 
  open, 
  onOpenChange, 
  onStatusChange,
  onEdit,
  onDelete 
}: BookDetailModalProps) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const { toast } = useToast();

  if (!book) return null;

  const handleStatusChange = async (newStatus: Book['status']) => {
    setIsChangingStatus(true);
    try {
      onStatusChange(book.id, newStatus);
      toast({
        title: "Status updated",
        description: `Book status changed to ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive",
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "fill-accent text-accent" 
            : i < rating 
            ? "fill-accent/50 text-accent" 
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-semibold">
            Book Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Cover & Actions */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted shadow-book">
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={`${statusColors[book.status]} shadow-md animate-scale-in`}>
                  {statusLabels[book.status]}
                </Badge>
              </div>
            </div>

            {/* Status Change Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Change Status</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <Button
                    key={status}
                    variant={book.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(status as Book['status'])}
                    disabled={isChangingStatus || book.status === status}
                    className="rounded-xl h-9 text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit?.(book)}
                className="flex-1 rounded-xl"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete?.(book.id)}
                className="flex-1 rounded-xl text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Book Information */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-display font-bold text-foreground leading-tight">
                {book.title}
              </h1>
              
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <User className="h-5 w-5" />
                <span className="font-medium">{book.author}</span>
              </div>

              <div className="flex items-center gap-2">
                {renderStars(book.rating)}
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  {book.rating}/5
                </span>
              </div>
            </div>

            {/* Book Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card-secondary rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Genre</span>
                </div>
                <p className="font-semibold text-card-foreground">{book.genre}</p>
              </div>

              <div className="bg-card-secondary rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Published</span>
                </div>
                <p className="font-semibold text-card-foreground">{book.publishedYear}</p>
              </div>

              <div className="bg-card-secondary rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Pages</span>
                </div>
                <p className="font-semibold text-card-foreground">{book.pages}</p>
              </div>

              <div className="bg-card-secondary rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Language</span>
                </div>
                <p className="font-semibold text-card-foreground">{book.language}</p>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* ISBN */}
            {book.isbn && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ISBN
                </h3>
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded-lg">
                  {book.isbn}
                </p>
              </div>
            )}

            {/* Added Date */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Added on {new Date(book.addedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};