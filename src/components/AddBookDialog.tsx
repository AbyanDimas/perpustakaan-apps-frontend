import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as pdfjsLib from 'pdfjs-dist';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Book } from "@/types/book";

// Setup pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(1, "Description is required"),
  genre: z.string().min(1, "Genre is required"),
  status: z.enum(["TERSEDIA", "DIPINJAM"]),
  pdf: z.instanceof(FileList).optional(),
  coverImage: z.instanceof(FileList).optional(),
});

interface AddBookDialogProps {
  children: React.ReactNode;
  mode: 'add' | 'edit';
  initialData?: Book;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
  progress: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddBookDialog = ({ children, mode, initialData, onSubmit, isPending, progress, open: openProp, onOpenChange: onOpenChangeProp }: AddBookDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChangeProp !== undefined ? onOpenChangeProp : setInternalOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      genre: "",
      status: "TERSEDIA",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        author: initialData.author || "",
        description: initialData.description || "",
        genre: initialData.genre || "",
        status: initialData.status || "TERSEDIA",
      });
    } else {
      form.reset(); // Clear form for 'add' mode
    }
  }, [initialData, open, form]);

  const pdfRef = form.register("pdf");
  const coverImageRef = form.register("coverImage");

  const handlePdfChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const metadata = await pdf.getMetadata();
      
      const title = metadata.info?.Title || '';
      const author = metadata.info?.Author || '';

      if (title) form.setValue('title', title, { shouldValidate: true });
      if (author) form.setValue('author', author, { shouldValidate: true });

    } catch (error) {
      console.error("Failed to parse PDF metadata:", error);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("author", values.author);
    formData.append("description", values.description);
    formData.append("genre", values.genre);
    formData.append("status", values.status);
    if (values.pdf && values.pdf.length > 0) {
      formData.append("pdf", values.pdf[0]);
    }
    if (values.coverImage && values.coverImage.length > 0) {
      formData.append("coverImage", values.coverImage[0]);
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Book' : 'Edit Book'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Great Gatsby" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="F. Scott Fitzgerald" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A novel about the American dream..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="Fiction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TERSEDIA">TERSEDIA</SelectItem>
                      <SelectItem value="DIPINJAM">DIPINJAM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="pdf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book PDF {isParsingPdf && "(Parsing...)"}</FormLabel>
                    <FormControl>
                      <Input type="file" accept=".pdf" {...pdfRef} onChange={handlePdfChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" {...coverImageRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="submit" disabled={isPending || isParsingPdf}>
                {isPending ? `Uploading... ${progress.toFixed(0)}%` : "Save Changes"}
              </Button>
            </DialogFooter>
            {isPending && (
              <div className="md:col-span-2">
                <Progress value={progress} />
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};