import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookPlus } from "lucide-react";
import { Book } from "@/types/book";
import { useToast } from "@/hooks/use-toast";

interface AddBookDialogProps {
  onAddBook: (book: Omit<Book, 'id'>) => void;
}

const genres = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery", 
  "Romance", "Biography", "History", "Technology", "Self-Help"
];

export const AddBookDialog = ({ onAddBook }: AddBookDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    coverImage: "",
    description: "",
    isbn: "",
    publishedYear: new Date().getFullYear(),
    pages: 0,
    rating: 0,
    language: "English"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newBook: Omit<Book, 'id'> = {
        ...formData,
        status: "available" as const,
        addedDate: new Date().toISOString()
      };

      onAddBook(newBook);
      
      toast({
        title: "Book added successfully!",
        description: `"${formData.title}" has been added to your library.`,
      });

      // Reset form
      setFormData({
        title: "",
        author: "",
        genre: "",
        coverImage: "",
        description: "",
        isbn: "",
        publishedYear: new Date().getFullYear(),
        pages: 0,
        rating: 0,
        language: "English"
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error adding book",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-primary-dark text-primary-foreground rounded-xl px-6 h-12 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Add New Book
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookPlus className="h-5 w-5 text-primary" />
            Add New Book
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="rounded-xl border-input-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                required
                className="rounded-xl border-input-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(value) => setFormData({...formData, genre: value})}>
                <SelectTrigger className="rounded-xl border-input-border">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                className="rounded-xl border-input-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
              placeholder="https://example.com/book-cover.jpg"
              className="rounded-xl border-input-border"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishedYear">Year</Label>
              <Input
                id="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => setFormData({...formData, publishedYear: parseInt(e.target.value)})}
                className="rounded-xl border-input-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value)})}
                className="rounded-xl border-input-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                className="rounded-xl border-input-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="rounded-xl border-input-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="rounded-xl border-input-border resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.author}
              className="flex-1 bg-gradient-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-12"
            >
              {isLoading ? "Adding..." : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};