export type BookStatus = 'TERSEDIA' | 'DIPINJAM';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  pdfPath: string;
  coverPath: string;
  genre: string;
  status: BookStatus;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookFilters {
  search: string;
  genre: string;
  status: string;
  sortBy: string;
  order: 'asc' | 'desc';
}
