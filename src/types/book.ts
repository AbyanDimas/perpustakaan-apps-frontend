export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  description: string;
  isbn: string;
  publishedYear: number;
  pages: number;
  rating: number;
  status: "available" | "borrowed" | "reserved";
  addedDate: string;
  language: string;
}

export interface BookFilters {
  search: string;
  genre: string;
  status: string;
  sortBy: "title" | "author" | "rating" | "addedDate";
}