import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = 3001;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${port}`;

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware to count visitors
app.use(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.dailyVisitor.update({
      where: { date: today },
      data: { count: { increment: 1 } },
    });
  } catch (error: any) {
    if (error.code === 'P2025') { // Record to update not found.
      try {
        await prisma.dailyVisitor.create({ data: { date: today, count: 1 } });
      } catch (e) {
        // In case of a race condition where another request created the record in the meantime
        console.error("Failed to create visitor record after update failed:", e);
      }
    } else {
      console.error("Failed to track visitor:", error);
    }
  }
  next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const getFullUrl = (filePath: string | null | undefined) => {
  if (!filePath) return null;
  return `${API_BASE_URL}/uploads/${path.basename(filePath)}`;
};

app.get('/api/stats', async (req, res) => {
  try {
    const totalBooks = await prisma.book.count();
    const availableBooks = await prisma.book.count({ where: { status: 'TERSEDIA' } });
    const borrowedBooks = totalBooks - availableBooks;
    const totalVisitors = await prisma.dailyVisitor.aggregate({ _sum: { count: true } });

    res.json({
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalVisitors: totalVisitors._sum.count || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await prisma.dailyVisitor.findMany({
      orderBy: { date: 'asc' },
      take: 30, // Last 30 days
    });
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    const genres = await prisma.book.findMany({
      where: {
        genre: {
          not: null,
        },
      },
      distinct: ['genre'],
      select: {
        genre: true,
      },
    });
    res.json(genres.map(g => g.genre));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.get('/api/languages', async (req, res) => {
  try {
    const languages = await prisma.book.findMany({
      where: {
        language: {
          not: null,
        },
      },
      distinct: ['language'],
      select: {
        language: true,
      },
    });
    res.json(languages.map(l => l.language));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

app.get('/api/books', async (req, res) => {
  const { sort, order = 'asc', genre, status, search, limit } = req.query;

  try {
    const where: any = {};
    if (genre) where.genre = genre as string;
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { author: { contains: search as string } },
        { description: { contains: search as string } },
        { genre: { contains: search as string } },
      ];
    }

    const orderBy: any = {};
    if (sort) {
      orderBy[sort as string] = order;
    } else {
      orderBy.createdAt = 'desc';
    }

    const take = limit ? parseInt(limit as string) : undefined;

    const books = await prisma.book.findMany({ where, orderBy, take });

    const booksWithFullPaths = books.map(book => ({
      ...book,
      pdfPath: getFullUrl(book.pdfPath),
      coverPath: getFullUrl(book.coverPath),
    }));
    res.json(booksWithFullPaths);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.post('/api/books', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  const { title, author, description, genre, status } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const pdfFile = files?.['pdf']?.[0];
  const coverImageFile = files?.['coverImage']?.[0];

  if (!title || !author || !description || !genre || !pdfFile) {
    return res.status(400).json({ error: 'Title, author, description, genre, and a PDF file are required.' });
  }

  if (status && !['TERSEDIA', 'DIPINJAM'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        genre,
        status: status || 'TERSEDIA',
        pdfPath: pdfFile ? `uploads/${pdfFile.filename}` : null,
        coverPath: coverImageFile ? `uploads/${coverImageFile.filename}` : null,
      },
    });
    
    const bookWithFullPaths = {
      ...newBook,
      pdfPath: getFullUrl(newBook.pdfPath),
      coverPath: getFullUrl(newBook.coverPath),
    };
    res.status(201).json(bookWithFullPaths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

app.put('/api/books/:id', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { title, author, description, genre, status } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const pdfFile = files?.['pdf']?.[0];
  const coverImageFile = files?.['coverImage']?.[0];

  if (status && !['TERSEDIA', 'DIPINJAM'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }

  try {
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const dataToUpdate: any = { title, author, description, genre, status };

    if (pdfFile) {
      dataToUpdate.pdfPath = `uploads/${pdfFile.filename}`;
    }
    if (coverImageFile) {
      dataToUpdate.coverPath = `uploads/${coverImageFile.filename}`;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: dataToUpdate,
    });

    const unlinkFile = (filePath: string | null) => {
      if (!filePath) return;
      const oldFilePath = path.join(uploadDir, path.basename(filePath));
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error(`Failed to delete old file: ${oldFilePath}`, err);
      });
    };

    if (pdfFile && existingBook.pdfPath) {
      unlinkFile(existingBook.pdfPath);
    }
    if (coverImageFile && existingBook.coverPath) {
      unlinkFile(existingBook.coverPath);
    }
    
    const bookWithFullPaths = {
      ...updatedBook,
      pdfPath: getFullUrl(updatedBook.pdfPath),
      coverPath: getFullUrl(updatedBook.coverPath),
    };

    res.json(bookWithFullPaths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await prisma.book.delete({ where: { id } });

    const unlinkFile = (filePath: string | null) => {
      if (!filePath) return;
      const oldFilePath = path.join(uploadDir, path.basename(filePath));
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error(`Failed to delete file: ${oldFilePath}`, err);
      });
    };

    unlinkFile(book.pdfPath);
    unlinkFile(book.coverPath);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  const { action, details } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required.' });
  }

  try {
    const log = await prisma.log.create({
      data: {
        action,
        details,
      },
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create log' });
  }
});

app.delete('/api/logs', async (req, res) => {
  try {
    await prisma.log.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete logs' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on ${API_BASE_URL}`);
});