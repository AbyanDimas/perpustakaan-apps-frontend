# Panduan Deployment ke RHEL 10 dengan Podman

Dokumen ini menjelaskan langkah-langkah untuk mendeploy aplikasi Books Library secara lengkap (Database, Backend, Frontend) di Red Hat Enterprise Linux (RHEL) 10 menggunakan Podman.

## Daftar Isi
1. [Prasyarat](#1-prasyarat)
2. [Klone Repositori](#2-klone-repositori)
3. [Konfigurasi Environment](#3-konfigurasi-environment)
4. [Membangun Container Images](#4-membangun-container-images)
5. [Setup Podman Pod](#5-setup-podman-pod)
6. [Menjalankan Kontainer](#6-menjalankan-kontainer)
    - [6.1. Database (MariaDB)](#61-database-mariadb)
    - [6.2. Backend](#62-backend)
    - [6.3. Frontend](#63-frontend)
7. [Migrasi Database](#7-migrasi-database)
8. [Setup Reverse Proxy (Nginx)](#8-setup-reverse-proxy-nginx)
9. [Verifikasi](#9-verifikasi)
10. [Manajemen Layanan dengan systemd](#10-manajemen-layanan-dengan-systemd)

---

### 1. Prasyarat

- Server dengan RHEL 10.
- `podman` terinstall.
- `git` terinstall.
- Akses `sudo` atau `root`.

### 2. Klone Repositori

```bash
git clone <URL_REPOSITORI_ANDA>
cd books-library
```

### 3. Konfigurasi Environment

Buat file `.env` di dalam direktori `backend` untuk konfigurasi koneksi database.

**File: `backend/.env`**
```env
DATABASE_URL="mysql://booksuser:yourstrongpassword@localhost:3306/booksdb"
PORT=3001
```

**Penting:**
- `localhost` digunakan karena semua kontainer akan berjalan di dalam Pod yang sama dan berbagi network namespace.
- Ganti `yourstrongpassword` dengan password yang aman.

### 4. Membangun Container Images

Kita perlu membangun image untuk backend dan frontend.

**4.1. Backend Image**
```bash
podman build -t books-library-backend -f backend/Dockerfile ./backend
```

**4.2. Frontend Image**
```bash
podman build -t books-library-frontend -f Dockerfile .
```

### 5. Setup Podman Pod

Sebuah Pod di Podman mengelompokkan kontainer agar mereka dapat berkomunikasi melalui `localhost`. Kita akan membuat Pod untuk menampung semua layanan aplikasi.

```bash
podman pod create --name books-library-pod -p 8080:80
```
Perintah ini membuat pod bernama `books-library-pod` dan memetakan port `8080` di host ke port `80` di dalam pod (yang akan digunakan oleh Nginx nanti).

### 6. Menjalankan Kontainer

Jalankan semua kontainer di dalam pod yang telah dibuat.

#### 6.1. Database (MariaDB)

```bash
podman run -d --pod books-library-pod --name mariadb \
  -e MYSQL_ROOT_PASSWORD=yourrootpassword \
  -e MYSQL_DATABASE=booksdb \
  -e MYSQL_USER=booksuser \
  -e MYSQL_PASSWORD=yourstrongpassword \
  -v books-library-db-data:/var/lib/mysql \
  docker.io/library/mariadb:latest
```
- `--pod books-library-pod`: Menjalankan kontainer di dalam pod yang sudah dibuat.
- `-v books-library-db-data:/var/lib/mysql`: Membuat volume persisten untuk data database.

#### 6.2. Backend

```bash
podman run -d --pod books-library-pod --name backend \
  --env-file=backend/.env \
  localhost/books-library-backend
```
- `--env-file`: Memuat variabel environment dari file `backend/.env`.

#### 6.3. Frontend

```bash
podman run -d --pod books-library-pod --name frontend \
  localhost/books-library-frontend
```

### 7. Migrasi Database

Setelah backend berjalan, jalankan migrasi database Prisma untuk membuat skema tabel.

```bash
podman exec -it backend npx prisma migrate deploy
```

### 8. Setup Reverse Proxy (Nginx)

Buat file konfigurasi Nginx untuk mengatur rute trafik ke frontend dan backend.

**Buat file `nginx.conf`:**
```nginx
events {}

http {
  server {
    listen 80;
    server_name localhost;

    # Rute untuk API Backend
    location /api/ {
      proxy_pass http://localhost:3001/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rute untuk Frontend
    location / {
      proxy_pass http://localhost:5173; # Port default Vite dev server, sesuaikan jika berbeda
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```
*Catatan: `Dockerfile` frontend menggunakan port `5173`. Jika Anda mengubahnya, sesuaikan `proxy_pass` di atas.*

**Jalankan kontainer Nginx:**
```bash
podman run -d --pod books-library-pod --name nginx \
  -v ./nginx.conf:/etc/nginx/nginx.conf:Z \
  docker.io/library/nginx:latest
```
- `-v ./nginx.conf:/etc/nginx/nginx.conf:Z`: Memuat file konfigurasi Nginx ke dalam kontainer. Flag `:Z` diperlukan untuk SELinux.

### 9. Verifikasi

Sekarang, aplikasi Anda seharusnya sudah bisa diakses melalui browser di `http://<IP_SERVER_ANDA>:8080`.

Gunakan perintah berikut untuk memeriksa status semua kontainer:
```bash
podman ps --pod -f name=books-library-pod
```

Untuk melihat log dari masing-masing kontainer:
```bash
podman logs -f <nama_kontainer> 
# Contoh: podman logs -f backend
```

### 10. Manajemen Layanan dengan systemd

Untuk menjalankan pod secara otomatis saat boot, Anda bisa membuat unit file `systemd`.

**Generate unit file:**
```bash
cd ~
podman generate systemd --name books-library-pod > pod-books-library.service
```

**Pindahkan dan aktifkan service:**
```bash
sudo mv pod-books-library.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pod-books-library.service
```

Sekarang pod Anda akan dikelola oleh `systemd` sebagai sebuah service.
