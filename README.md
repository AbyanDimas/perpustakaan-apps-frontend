# Books Library Application

Aplikasi perpustakaan buku modern yang dirancang untuk skalabilitas dan ketersediaan tinggi (High Availability).

## Arsitektur Sistem

Arsitektur ini dirancang untuk menjadi tangguh, skalabel, dan mudah dikelola menggunakan prinsip Infrastructure as Code.

```
Pengguna
   |
   v
[AWS Application Load Balancer]  <-- (Menerima traffic dari internet, terminasi SSL)
   |
   +----------------------------------------+
   |                                        |
   v                                        v
[Grup Auto-Scaling FE (6x EC2)]        [Grup Auto-Scaling BE (4x EC2)]
 - Docker Container (Nginx + React)       - Docker Container (Node.js API)
   |                                        |
   |                                        v
   +--------------------------------------->[AWS Application Load Balancer Internal]
                                            |
                                            +--------------------------+
                                            |                          |
                                            v                          v
                                       [AWS ElastiCache - Redis]  [AWS RDS - Primary DB]
                                       (Untuk Caching Bersama)     |
                                                                   v
                                                              [AWS RDS - Replica DB]
                                                              (Untuk Failover & Read Replica)
```

### Komponen Utama:

- **Load Balancer**: Menggunakan AWS Application Load Balancer (ALB) untuk mendistribusikan traffic secara merata. Satu ALB publik untuk frontend, dan satu ALB internal untuk backend.
- **Frontend (FE)**: Aplikasi React yang di-build sebagai file statis dan disajikan oleh Nginx. Dijalankan di dalam kontainer Docker pada 6 EC2 instance untuk redundansi.
- **Backend (BE)**: API Node.js (Express/Fastify) yang berjalan di dalam kontainer Docker pada 4 EC2 instance. Berkomunikasi satu sama lain melalui cache bersama.
- **Cache**: AWS ElastiCache (Redis) digunakan sebagai lapisan cache terdistribusi untuk mengurangi beban database dan mempercepat respons.
- **Database**: AWS RDS (misalnya, PostgreSQL) dengan konfigurasi Multi-AZ (Primary & Replica) untuk memastikan High Availability dan menyediakan backup otomatis.

## Tumpukan Teknologi

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM
- **Database**: PostgreSQL (direkomendasikan)
- **Containerization**: Docker
- **Automation & IaC**: Ansible
- **Cloud Provider**: AWS (EC2, ALB, RDS, ElastiCache)

## Deployment

Proses deployment sepenuhnya otomatis menggunakan Ansible.

### Prasyarat

1.  **AWS Account**: Konfigurasi kredensial AWS pada mesin yang akan menjalankan Ansible.
2.  **Ansible**: Terinstal di mesin kontrol.
3.  **Docker**: Terinstal di mesin kontrol (opsional, untuk build lokal).

### Langkah-langkah Deployment

1.  **Konfigurasi Inventory Ansible**: Isi file `inventory` dengan alamat IP atau DNS dari EC2 instance yang telah dibuat.
2.  **Jalankan Playbook**: Eksekusi playbook utama untuk mendeploy seluruh tumpukan.
    ```bash
    ansible-playbook playbook.yml
    ```

Playbook akan melakukan tugas-tugas berikut:
- Menginstal Docker di semua instance.
- Membangun image Docker untuk frontend dan backend.
- Menjalankan kontainer di grup server yang sesuai.
- Mengkonfigurasi aplikasi untuk terhubung ke RDS dan ElastiCache.

## Pengujian (Testing)

Proyek backend dilengkapi dengan suite pengujian End-to-End (E2E) untuk memverifikasi fungsionalitas dan ketahanan API, termasuk simulasi beban untuk menguji `rate limiting`.

### Prasyarat

Sebelum menjalankan tes, instal semua dev dependencies dari dalam direktori `backend`:

```bash
cd backend
npm install
```

### Menjalankan Tes

Tes dirancang untuk dijalankan terhadap server yang sedang aktif. Ini bisa server lokal Anda atau server yang sudah di-deploy (staging).

#### 1. Tes Lingkungan Lokal

Anda perlu dua terminal di dalam direktori `backend`.

**Di Terminal 1 (Jalankan Server):**

```bash
npm run dev
```

**Di Terminal 2 (Jalankan Tes):**

```bash
npm test
```

Tes akan secara otomatis menargetkan `http://localhost:3001`.

#### 2. Tes Lingkungan Deploy (Staging)

Anda dapat menargetkan URL server mana pun dengan menggunakan environment variable `TEST_TARGET_URL`. Ini sangat berguna untuk menguji lingkungan `staging` sebelum deploy ke produksi.

```bash
# Ganti dengan URL staging Anda
TEST_TARGET_URL=https://api.staging.domain-anda.com npm test
```

### Alur Kerja Pengujian yang Direkomendasikan

Untuk menjaga stabilitas dan keamanan, sangat penting untuk memisahkan jenis pengujian berdasarkan lingkungannya:

1.  **Lingkungan Staging**: Gunakan lingkungan ini untuk pengujian menyeluruh. Jalankan semua tes fungsional dan tes beban (simulasi *brute-force*) di sini untuk memastikan aplikasi kuat.
2.  **Lingkungan Produksi**: **JANGAN** menjalankan tes beban di server produksi. Setelah deployment, cukup lakukan **Smoke Test** (tes ringan yang memeriksa apakah endpoint utama aktif) untuk memastikan deployment berhasil tanpa mengganggu pengguna.