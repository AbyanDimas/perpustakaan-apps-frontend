
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DatabaseSeedingInstructionsProps {
  onClose: () => void;
}

export function DatabaseSeedingInstructions({ onClose }: DatabaseSeedingInstructionsProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-2xl mx-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle>Gagal Memuat Data Buku</CardTitle>
          <CardDescription>
            Database Anda mungkin kosong. Ikuti langkah-langkah di bawah ini untuk mengisi database dengan data awal (seeding).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Langkah 1: Buka Terminal Baru</h3>
            <p className="text-sm text-muted-foreground">
              Buka terminal atau command prompt baru di root proyek Anda.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Langkah 2: Masuk ke Direktori Backend</h3>
            <p className="text-sm text-muted-foreground">
              Jalankan perintah berikut untuk berpindah ke direktori backend.
            </p>
            <pre className="mt-2 p-2 bg-secondary rounded-md text-sm">
              <code>cd backend</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold">Langkah 3: Install Dependencies (Jika belum)</h3>
            <p className="text-sm text-muted-foreground">
              Jika ini pertama kalinya Anda menjalankan backend, install semua package yang dibutuhkan.
            </p>
            <pre className="mt-2 p-2 bg-secondary rounded-md text-sm">
              <code>npm install</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold">Langkah 4: Jalankan Perintah Seeding</h3>
            <p className="text-sm text-muted-foreground">
              Perintah ini akan menjalankan script `prisma/seed.ts` untuk mengisi database Anda.
            </p>
            <pre className="mt-2 p-2 bg-secondary rounded-md text-sm">
              <code>npm run prisma:seed</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold">Langkah 5: Muat Ulang Halaman</h3>
            <p className="text-sm text-muted-foreground">
              Setelah proses seeding selesai, kembali ke browser dan segarkan halaman ini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
