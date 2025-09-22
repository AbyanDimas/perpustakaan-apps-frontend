import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Book as BookIcon, PlusCircle, Users, BookOpen } from "lucide-react";
import { BookDataTable } from "@/components/BookDataTable";
import { AddBookDialog } from "@/components/AddBookDialog";
import { BookDetailModal } from "@/components/BookDetailModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardCard } from "@/components/DashboardCard";

// API functions
const API_URL = import.meta.env.VITE_API_URL;

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_URL}/books`);
  if (!response.ok) throw new Error("Failed to fetch books");
  return response.json();
};

const fetchStats = async () => {
  const response = await fetch(`${API_URL}/stats`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
};

const uploadWithProgress = (url: string, data: FormData, onProgress: (progress: number) => void) => {
  return new Promise<Book>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.send(data);
  });
};

const addBook = async ({ data, onProgress }: { data: FormData, onProgress: (progress: number) => void }): Promise<Book> => {
  return uploadWithProgress(`${API_URL}/books`, data, onProgress);
};

const updateBook = async ({ id, data, onProgress }: { id: string, data: FormData, onProgress: (progress: number) => void }): Promise<Book> => {
  return uploadWithProgress(`${API_URL}/books/${id}`, data, onProgress);
};

const deleteBook = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/books/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete book");
};

export default function AdminPage() {
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [previewingBook, setPreviewingBook] = useState<Book | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();

  const { data: books = [], isLoading: isLoadingBooks, isError: isErrorBooks } = useQuery<Book[]>({ 
    queryKey: ['admin-books'], 
    queryFn: fetchBooks 
  });

  const { data: statsData, isLoading: isLoadingStats} = useQuery({ 
    queryKey: ['stats'], 
    queryFn: fetchStats 
  });

  const addMutation = useMutation({ 
    mutationFn: addBook,
    onSuccess: () => {
      toast.success("Book added successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setUploadProgress(0);
    },
    onError: () => {
      toast.error("Failed to add book.");
      setUploadProgress(0);
    }
  });

  const updateMutation = useMutation({ 
    mutationFn: updateBook,
    onSuccess: () => {
      toast.success("Book updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setEditingBook(undefined);
      setUploadProgress(0);
    },
    onError: () => {
      toast.error("Failed to update book.");
      setUploadProgress(0);
    }
  });

  const deleteMutation = useMutation({ 
    mutationFn: deleteBook,
    onSuccess: () => {
      toast.success("Book deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: () => toast.error("Failed to delete book.")
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
  };

  const handlePreview = (book: Book) => {
    setPreviewingBook(book);
  };

  const handleFormSubmit = (data: FormData) => {
    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, data, onProgress: setUploadProgress });
    } else {
      addMutation.mutate({ data, onProgress: setUploadProgress });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">A quick overview of your library.</p>
        </div>
        <div className="flex items-center gap-4">
          <AddBookDialog 
            mode="add" 
            onSubmit={handleFormSubmit} 
            isPending={addMutation.isPending}
            progress={uploadProgress}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambahkan Buku
            </Button>
          </AddBookDialog>
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard title="Total Buku" value={isLoadingStats ? 'Loading...' : statsData?.totalBooks.toString()} icon={BookOpen} />
        <DashboardCard title="Tersedia" value={isLoadingStats ? 'Loading...' : statsData?.availableBooks.toString()} icon={BookIcon} />
        <DashboardCard title="Terjual" value={isLoadingStats ? 'Loading...' : statsData?.borrowedBooks.toString()} icon={Users} />
        <DashboardCard title="Pengunjung" value={isLoadingStats ? 'Loading...'  : statsData?.totalVisitors.toString()} icon={Users} />
      </div>

      <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Books Management</h2>
          {isLoadingBooks ? (
            <p>Loading...</p>
          ) : isErrorBooks ? (
            <div className="rounded-lg border flex items-center justify-center h-full mt-5 pb-10 pt-10 text-white bg-red-700"> Gagal Mendapatkan Informasi</div>
          ) : (
            <BookDataTable books={books} onDelete={handleDelete} onEdit={handleEdit} onPreview={handlePreview} />
          )}
      </div>

      {editingBook && (
        <AddBookDialog 
          mode="edit" 
          initialData={editingBook}
          onSubmit={handleFormSubmit} 
          isPending={updateMutation.isPending}
          progress={uploadProgress}
          open={!!editingBook}
          onOpenChange={(open) => !open && setEditingBook(undefined)}
        >
          <></>
        </AddBookDialog>
      )}
      <BookDetailModal 
        book={previewingBook} 
        open={!!previewingBook} 
        onOpenChange={(open) => !open && setPreviewingBook(undefined)}
      />
    </>
  );
}
