# 🚀 OpenJob RESTful API V2

> **OpenJob** — Sebuah RESTful API untuk platform lowongan kerja (job portal) yang dibangun menggunakan **Express.js** dan **PostgreSQL**, dengan arsitektur **microservice** (API App + Consumer App) yang berkomunikasi melalui **RabbitMQ**.

![Node.js](https://img.shields.io/badge/Node.js-v24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-v5-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

---

## :ledger: Index

- [🚀 OpenJob RESTful API V2](#-openjob-restful-api-v2)
  - [:beginner: About](#beginner-about)
  - [:zap: Usage](#zap-usage)
  - [:electric\_plug: Installation](#electric_plug-installation)
  - [:package: Commands](#package-commands)
  - [:wrench: Development](#wrench-development)
  - [:file\_folder: File Structure](#file_folder-file-structure)
  - [:question: FAQ](#question-faq)
  - [:page\_facing\_up: Resources](#page_facing_up-resources)
  - [:star2: Credit/Acknowledgment](#star2-creditacknowledgment)
  - [:lock: License](#lock-license)
  - [:globe\_with\_meridians: My Social Media](#globe_with_meridians-my-social-media)

---

## :beginner: About

**OpenJob RESTful API V2** adalah sebuah *backend service* untuk platform pencarian dan perekrutan kerja (*job portal*). Proyek ini dibangun sebagai submission dalam kursus **Belajar Fundamental Back-End dengan JavaScript** di [Dicoding](https://www.dicoding.com/).

Proyek ini terdiri dari **2 aplikasi independen** yang saling berkomunikasi melalui **RabbitMQ**:

| Aplikasi | Deskripsi |
|---|---|
| **baji-openjob-app** | API utama (Express.js) — menangani semua endpoint REST |
| **baji-openjob-consumer** | Worker independen — memproses antrian pesan & mengirim email notifikasi |

### Fitur Utama

- 🔐 **Autentikasi & Otorisasi** — JWT (Access Token & Refresh Token)
- 👤 **Manajemen Pengguna** — CRUD user dan profil pengguna
- 🏢 **Manajemen Perusahaan** — CRUD data perusahaan
- 🏷️ **Kategori Pekerjaan** — Pengelompokan lowongan berdasarkan kategori
- 💼 **Lowongan Kerja (Jobs)** — CRUD lowongan kerja dengan detail lengkap
- 📝 **Lamaran Kerja (Applications)** — Pengguna dapat melamar pekerjaan
- 🔖 **Bookmark Lowongan** — Simpan lowongan favorit
- 📄 **Upload Dokumen PDF** — Upload berkas PDF menggunakan Multer (maks 5MB)
- ⚡ **Caching (Redis)** — Server-side caching dengan header `X-Data-Source`
- 🐇 **Message Queue (RabbitMQ)** — Notifikasi email otomatis saat ada lamaran baru
- ✅ **Validasi Data** — Menggunakan **Joi**
- 🛡️ **Error Handling** — Custom error classes dengan middleware terpusat

---

## :zap: Usage

### Base URL

```
http://localhost:3000
```

### Endpoint Overview

#### 🏠 Root

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/` | Health check API | ❌ |

#### 👤 Users

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/users` | Registrasi pengguna baru | ❌ |
| `GET` | `/users/:id` | Lihat detail user | ❌ |

#### 🔐 Authentications

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/authentications` | Login (mendapatkan token) | ❌ |
| `PUT` | `/authentications` | Refresh access token | ❌ |
| `DELETE` | `/authentications` | Logout (hapus refresh token) | ❌ |

#### 📋 Profile

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/profile` | Lihat profil pengguna | ✅ |
| `GET` | `/profile/applications` | Lihat lamaran milik pengguna | ✅ |
| `GET` | `/profile/bookmarks` | Lihat bookmark milik pengguna | ✅ |

#### 🏢 Companies

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/companies` | Lihat daftar perusahaan | ❌ |
| `GET` | `/companies/:id` | Lihat detail perusahaan | ❌ |
| `POST` | `/companies` | Tambah perusahaan | ✅ |
| `PUT` | `/companies/:id` | Update data perusahaan | ✅ |
| `DELETE` | `/companies/:id` | Hapus perusahaan | ✅ |

#### 🏷️ Categories

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/categories` | Lihat daftar kategori | ❌ |
| `GET` | `/categories/:id` | Lihat detail kategori | ❌ |
| `POST` | `/categories` | Tambah kategori | ✅ |
| `PUT` | `/categories/:id` | Update kategori | ✅ |
| `DELETE` | `/categories/:id` | Hapus kategori | ✅ |

#### 💼 Jobs

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/jobs` | Lihat daftar lowongan | ❌ |
| `GET` | `/jobs/:id` | Lihat detail lowongan | ❌ |
| `GET` | `/jobs/company/:companyId` | Lihat lowongan per perusahaan | ❌ |
| `GET` | `/jobs/category/:categoryId` | Lihat lowongan per kategori | ❌ |
| `GET` | `/jobs/bookmarks` | Lihat lowongan yang di-bookmark | ✅ |
| `POST` | `/jobs` | Tambah lowongan kerja | ✅ |
| `POST` | `/jobs/:id/bookmark` | Bookmark sebuah lowongan | ✅ |
| `GET` | `/jobs/:id/bookmark/:bookmarkId` | Lihat detail bookmark | ✅ |
| `PUT` | `/jobs/:id` | Update lowongan kerja | ✅ |
| `DELETE` | `/jobs/:id` | Hapus lowongan kerja | ✅ |
| `DELETE` | `/jobs/:id/bookmark` | Hapus bookmark lowongan | ✅ |

#### 📝 Applications

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/applications` | Lihat daftar semua lamaran | ✅ |
| `GET` | `/applications/:id` | Lihat detail lamaran | ✅ |
| `GET` | `/applications/user/:user_id` | Lihat lamaran per pengguna | ✅ |
| `GET` | `/applications/job/:job_id` | Lihat lamaran per lowongan | ✅ |
| `POST` | `/applications` | Ajukan lamaran kerja | ✅ |
| `PUT` | `/applications/:id` | Update status lamaran | ✅ |
| `DELETE` | `/applications/:id` | Hapus lamaran | ✅ |

#### 🔖 Bookmarks

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/bookmarks` | Lihat semua bookmark user | ✅ |
| `GET` | `/bookmarks/:id` | Lihat detail bookmark | ✅ |
| `DELETE` | `/bookmarks/:id` | Hapus bookmark | ✅ |

#### 📄 Documents

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/documents` | Upload dokumen PDF | ✅ |
| `GET` | `/documents/:id` | Lihat detail dokumen | ✅ |

> **✅ Auth** = Membutuhkan header `Authorization: Bearer <access_token>`

---

## :electric_plug: Installation

### Pre-Requisites

| Tool | Versi Minimum | Deskripsi |
|------|---------------|-----------|
| **Node.js** | v18+ | Runtime JavaScript |
| **npm** | v9+ | Package manager |
| **PostgreSQL** | v14+ | Relational database |
| **Redis** | v7+ | In-memory cache |
| **RabbitMQ** | v3+ | Message broker |
| **Docker** (opsional) | v20+ | Untuk menjalankan Redis & RabbitMQ |

### Langkah Instalasi

**1. Clone repository:**

```bash
git clone https://github.com/bajiff/baji-openjob-api-v2.git
cd baji-openjob-api-v2
```

**2. Jalankan Redis & RabbitMQ (via Docker):**

```bash
docker-compose up -d
```

**3. Setup API App (`baji-openjob-app`):**

```bash
cd baji-openjob-app
npm install
```

Buat file `.env` di dalam folder `baji-openjob-app/`:

```env
HOST=localhost
PORT=3000

PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=db_openjob_v2
PGHOST=localhost
PGPORT=5432
DATABASE_URL=postgres://your_db_user:your_db_password@localhost:5432/db_openjob_v2

ACCESS_TOKEN_KEY=your_access_token_secret_key
REFRESH_TOKEN_KEY=your_refresh_token_secret_key

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

Buat database dan jalankan migrasi:

```bash
createdb db_openjob_v2
npm run migrate up
```

**4. Setup Consumer App (`baji-openjob-consumer`):**

```bash
cd ../baji-openjob-consumer
npm install
```

Buat file `.env` di dalam folder `baji-openjob-consumer/`:

```env
# PostgreSQL (sama dengan App)
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=db_openjob_v2
PGHOST=localhost
PGPORT=5432

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Email (Mailtrap Sandbox)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_password
```

**5. Jalankan kedua aplikasi (di terminal terpisah):**

```bash
# Terminal 1 — API App
cd baji-openjob-app
npm run start:dev

# Terminal 2 — Consumer App
cd baji-openjob-consumer
npm start
```

Server API akan berjalan di `http://localhost:3000`.

---

## :package: Commands

### baji-openjob-app

| Perintah | Deskripsi |
|----------|-----------|
| `npm start` | Menjalankan server mode production |
| `npm run start:dev` | Menjalankan server mode development (nodemon) |
| `npm run lint` | Menjalankan ESLint |
| `npm run migrate up` | Menjalankan migrasi database |
| `npm run migrate down` | Rollback migrasi database |
| `npm run truncate` | Mengosongkan semua tabel + cache Redis |

### baji-openjob-consumer

| Perintah | Deskripsi |
|----------|-----------|
| `npm start` | Menjalankan consumer worker |

---

## :wrench: Development

### Arsitektur

```
┌─────────────────────┐         ┌──────────────┐         ┌─────────────────────┐
│  baji-openjob-app   │───────▶│   RabbitMQ   │◀────────│ baji-openjob-consumer│
│  (Express.js API)   │ publish │  (Message    │ consume │  (Worker/Listener)   │
│                     │         │   Broker)    │         │                     │
│  - REST Endpoints   │         └──────────────┘         │  - Email Notifikasi │
│  - JWT Auth         │                                  │  - Nodemailer       │
│  - Redis Cache      │         ┌──────────────┐         │                     │
│  - Multer Upload    │───────▶│  PostgreSQL  │◀────────│                     │
│                     │         │  (Database)  │         │                     │
└─────────────────────┘         └──────────────┘         └─────────────────────┘
                                ┌──────────────┐
                                │    Redis     │
                                │   (Cache)    │
                                └──────────────┘
```

**Alur Message Queue:**
1. User melamar pekerjaan via `POST /applications`
2. API App mempublikasikan pesan `application_created` ke RabbitMQ
3. Consumer App menerima pesan, query data pelamar ke database
4. Consumer App mengirim email notifikasi ke pemilik lowongan via Nodemailer

---

## :file_folder: File Structure

```bash
.
├── baji-openjob-app/                        # API App (Express.js)
│   ├── migrations/                          # File migrasi database
│   │   ├── ..._create-table-users.js
│   │   ├── ..._create-table-authentications.js
│   │   ├── ..._create-table-companies.js
│   │   ├── ..._create-table-categories.js
│   │   ├── ..._create-table-jobs.js
│   │   ├── ..._create-table-applications.js
│   │   ├── ..._create-table-bookmarks.js
│   │   ├── ..._add-user-id-to-companies.js
│   │   └── ..._create-table-documents.js
│   ├── src/
│   │   ├── api/                             # Modul API (handler, routes, index)
│   │   │   ├── applications/
│   │   │   ├── authentications/
│   │   │   ├── bookmarks/
│   │   │   ├── categories/
│   │   │   ├── companies/
│   │   │   ├── documents/
│   │   │   ├── jobs/
│   │   │   ├── profile/
│   │   │   └── users/
│   │   ├── config/                          # Konfigurasi eksternal
│   │   │   ├── rabbitmq.js                  # RabbitMQ publisher connection
│   │   │   └── redis.js                     # Redis client connection
│   │   ├── exceptions/                      # Custom Error Classes
│   │   │   ├── AuthenticationError.js
│   │   │   ├── ClientError.js
│   │   │   ├── InvariantError.js
│   │   │   └── NotFoundError.js
│   │   ├── middlewares/                     # Express Middlewares
│   │   │   ├── auth.js                      # JWT authentication
│   │   │   ├── cache.js                     # Redis caching middleware
│   │   │   ├── errorHandler.js              # Centralized error handler
│   │   │   └── upload.js                    # Multer PDF upload
│   │   ├── services/postgres/               # Business Logic & Database
│   │   │   ├── ApplicationsService.js
│   │   │   ├── AuthenticationsService.js
│   │   │   ├── BookmarksService.js
│   │   │   ├── CategoriesService.js
│   │   │   ├── CompaniesService.js
│   │   │   ├── DocumentsService.js
│   │   │   ├── JobsService.js
│   │   │   ├── UsersService.js
│   │   │   └── pool.js
│   │   ├── tokenize/
│   │   │   └── TokenManager.js              # JWT token management
│   │   ├── validator/                       # Request validation (Joi)
│   │   │   ├── applications/
│   │   │   ├── authentications/
│   │   │   ├── bookmarks/
│   │   │   ├── categories/
│   │   │   ├── companies/
│   │   │   ├── jobs/
│   │   │   └── users/
│   │   └── server.js                        # Entry point API
│   ├── uploads/documents/                   # Direktori penyimpanan file PDF
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package.json
│   └── truncate.js
│
├── baji-openjob-consumer/                   # Consumer App (Worker)
│   ├── src/
│   │   ├── postgres/
│   │   │   └── pool.js                      # PostgreSQL connection (independen)
│   │   └── consumer.js                      # Entry point consumer
│   ├── .env
│   └── package.json
│
├── docker-compose.yml                       # Redis & RabbitMQ containers
├── .gitignore
└── README.md
```

---

## :question: FAQ

**Q: Apakah saya harus membuat database secara manual?**

> Ya, buat database PostgreSQL terlebih dahulu dengan `createdb db_openjob_v2`, lalu jalankan `npm run migrate up` di folder `baji-openjob-app`.

**Q: Bagaimana cara mendapatkan access token?**

> Lakukan POST ke `/authentications` dengan body `{ "username": "...", "password": "..." }`. Response berisi `accessToken` dan `refreshToken`.

**Q: Kenapa ada 2 folder project terpisah?**

> Sesuai best practice microservice. API App dan Consumer App berjalan sebagai proses independen. Keduanya berkomunikasi melalui RabbitMQ, sehingga jika Consumer mati, API tetap berjalan normal.

**Q: Apakah harus menjalankan Docker?**

> Docker hanya untuk mempermudah menjalankan Redis dan RabbitMQ. Jika Tuan sudah menginstal keduanya secara native, Docker tidak diperlukan.

---

## :page_facing_up: Resources

- [Express.js v5 Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [Joi Validation Library](https://joi.dev/)
- [JSON Web Token (JWT)](https://jwt.io/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/docs)
- [Redis Documentation](https://redis.io/docs/)
- [Multer — File Upload](https://github.com/expressjs/multer)
- [Dicoding — Belajar Fundamental Back-End dengan JavaScript](https://www.dicoding.com/academies/271)

---

## :star2: Credit/Acknowledgment

- **Bagus Aji Fernando** (Baji) — Author & Developer
- [Dicoding Indonesia](https://www.dicoding.com/) — Platform pembelajaran yang menginspirasi proyek ini

---

## :lock: License

Proyek ini dilisensikan di bawah **ISC License**.

---

## :globe_with_meridians: My Social Media

| Platform | Link |
|----------|------|
| **GitHub** | [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/bajiff) |
| **LinkedIn** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/bagus-aji-fernando-466347286/) |
| **Instagram** | [![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/_bajif) |
| **Threads** | [![Threads](https://img.shields.io/badge/Threads-000000?style=for-the-badge&logo=threads&logoColor=white)](https://www.threads.com/@_bajif/) |
| **X** | [![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/_bajif) |

---

## :mailbox: Contact

📧 **GitHub Issues:** [https://github.com/bajiff/baji-openjob-api-v2/issues](https://github.com/bajiff/baji-openjob-api-v2/issues)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/bajiff">Bagus Aji Fernando</a>
</p>
