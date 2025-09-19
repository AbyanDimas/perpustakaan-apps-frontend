import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { ExternalLink } from "lucide-react";

interface BookDetailModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailModal({ book, open, onOpenChange }: BookDetailModalProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="flex">
          <div className="w-1/3">
            <img 
              src={book.coverPath || './placeholder.svg'} 
              alt={book.title} 
              className="object-cover h-full w-full rounded-l-lg"
            />
          </div>
          <div className="w-2/3 p-8 flex flex-col">
            <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
            <p className="text-lg text-muted-foreground mb-4">{book.author}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="secondary">{book.genre}</Badge>
              <Badge variant={book.status === 'TERSEDIA' ? 'default' : 'outline'}>
                {book.status}
              </Badge>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto">
              <p>{book.description}</p>
            </div>

            <Button asChild className="mt-6 w-full">
              <a href={book.pdfPath || '#'} target="_blank" rel="noopener noreferrer" disabled={!book.pdfPath}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View PDF
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}