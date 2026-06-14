# 📋 Planning Submission: OpenJob RESTful API Versi 2

> Target: **Bintang 5 (Advanced)** — Nilai Akhir = 4.0 (semua kriteria full 4 pts)

---

## 🗺️ Gambaran Umum

| Kriteria | Teknologi | Target Nilai |
|---|---|---|
| Kriteria 1 — Upload PDF | Multer + Storage lokal | 4 pts (Advanced) |
| Kriteria 2 — Caching | Redis + `X-Data-Source` header | 4 pts (Advanced) |
| Kriteria 3 — Message Queue | RabbitMQ + Nodemailer | 4 pts (Advanced) |

### Folder Postman Collection

Berdasarkan file collection yang digunakan:

| Folder | Keterangan | Jalankan di Runner? |
|---|---|---|
| `[Mandatory] Users` | CRUD user, validasi payload | ✅ Ya |
| `[Mandatory] Documents` | Upload/download PDF | ❌ Manual saja |
| `Companies` | CRUD perusahaan + auth | ✅ Ya |
| `Categories` | CRUD kategori | ✅ Ya |
| `Jobs` | CRUD lowongan | ✅ Ya |
| `Applications` | CRUD lamaran | ✅ Ya |
| `Bookmarks` | Tambah/hapus bookmark | ✅ Ya |
| `Authentications` | Login, refresh, logout | ✅ Ya |
| `Profile` | Get profile, applications, bookmarks | ✅ Ya |
| `[Mandatory] Cache` | Cache miss/hit + invalidation | ✅ Ya |
| `[RabbitMQ] Feature Test` | Publish + consume MQ | ✅ Ya |

---

## ⚙️ FASE 0 — Persiapan Lingkungan

### 0.1 Pastikan Node.js v22 LTS terpasang

```bash
node -v   # harus v22.x.x
npm -v
```

Jika belum, install via nvm:

```bash
nvm install 22
nvm use 22
```

### 0.2 Install dan jalankan Redis

```bash
# Linux/WSL
sudo apt update && sudo apt install redis-server
sudo service redis-server start

# Verifikasi
redis-cli ping   # harus balas: PONG
```

### 0.3 Install dan jalankan RabbitMQ

```bash
# Linux/WSL
sudo apt install rabbitmq-server
sudo service rabbitmq-server start

# Aktifkan management plugin (opsional tapi berguna untuk debug)
sudo rabbitmq-plugins enable rabbitmq_management
# Buka http://localhost:15672 — user: guest / pass: guest

# Verifikasi
sudo rabbitmqctl status
```

### 0.4 Siapkan folder uploads

```bash
mkdir -p uploads/documents
```

---

## 📦 FASE 1 — Install Dependencies Baru

```bash
npm install multer ioredis amqplib nodemailer
```

| Package | Kegunaan |
|---|---|
| `multer` | Upload file PDF (wajib digunakan per kriteria) |
| `ioredis` | Koneksi ke Redis |
| `amqplib` | Koneksi ke RabbitMQ |
| `nodemailer` | Kirim email dari consumer |

---

## 🔑 FASE 2 — Konfigurasi Environment Variables

Buat/update file `.env`:

```env
# === SERVER ===
PORT=3000

# === DATABASE ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=openjob
DB_USER=postgres
DB_PASSWORD=yourpassword

# === REDIS (nama wajib sesuai instruksi) ===
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# === RABBITMQ (nama wajib sesuai instruksi) ===
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# === EMAIL / NODEMAILER (nama wajib sesuai instruksi) ===
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=emailkamu@gmail.com
MAIL_PASSWORD=app_password_gmail
```

> ⚠️ **Port server wajib `3000`** — sesuai Postman Environment (`"port": "3000"`).

> 💡 Untuk Gmail: aktifkan 2FA → buat **App Password** di Akun Google → Keamanan → App passwords.

---

## 📁 FASE 3 — Struktur File Baru

```
openjob-api/
├── src/
│   ├── config/
│   │   ├── redis.js                       ← Koneksi Redis
│   │   └── rabbitmq.js                    ← Publisher RabbitMQ
│   ├── middlewares/
│   │   ├── upload.middleware.js           ← Multer config
│   │   └── cache.middleware.js            ← Helper cache Redis
│   ├── routes/
│   │   └── document.routes.js            ← Route /documents
│   └── consumer/
│       └── application.consumer.js       ← Consumer RabbitMQ + email
├── uploads/
│   └── documents/                        ← Tempat PDF disimpan
├── .env
└── package.json
```

---

## 🔧 FASE 4 — Implementasi Kriteria 1: Upload PDF

### ⚠️ Hal Kritis dari Collection Postman

Berdasarkan test collection, endpoint `/documents` diuji dengan:

- Field form-data bernama **`document`** (bukan `file`)
- Response sukses upload **wajib** punya field: `documentId`, `filename`, `originalName`, `size`
- `GET /documents` → kembalikan `{ status: 'success', data: { documents: [...] } }`
- `GET /documents/:id` → kembalikan file PDF dengan header `Content-Type: application/pdf` dan `Content-Disposition`
- `GET /documents/xxx` → kembalikan `404`
- Upload tanpa file → `{ status: 'failed', message: '...required...' }`
- Upload non-PDF → `{ status: 'failed', message: '...File is required...' }`
- Upload/Delete tanpa auth → `401`

### 4.1 Buat tabel `documents` di database

```sql
CREATE TABLE documents (
  id VARCHAR(255) PRIMARY KEY,       -- gunakan UUID/nanoid seperti pola v1
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,    -- nama file tersimpan di disk
  original_name VARCHAR(255),        -- nama asli dari user
  size INTEGER,                      -- ukuran file dalam bytes
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Buat `src/middlewares/upload.middleware.js`

```js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Tolak jika bukan PDF — pesan harus mengandung 'File is required' sesuai test
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('File is required and must be a PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
```

### 4.3 Buat `src/routes/document.routes.js`

```js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid'; // atau uuid, sesuaikan dengan pola v1
import upload from '../middlewares/upload.middleware.js';
import pool from '../config/db.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// POST /documents — upload PDF (wajib auth)
router.post('/', authMiddleware, (req, res) => {
  upload.single('document')(req, res, async (err) => {
    // Tangani error multer (file tidak ada, bukan PDF, terlalu besar)
    if (err || !req.file) {
      return res.status(400).json({
        status: 'failed',
        message: err ? err.message : 'File is required',
      });
    }

    try {
      const id = nanoid();
      const { filename, originalname, size } = req.file;
      const userId = req.user.id;

      await pool.query(
        'INSERT INTO documents (id, user_id, filename, original_name, size) VALUES ($1, $2, $3, $4, $5)',
        [id, userId, filename, originalname, size]
      );

      return res.status(201).json({
        status: 'success',
        data: {
          documentId: id,
          filename,
          originalName: originalname,
          size,
        },
      });
    } catch (dbErr) {
      return res.status(500).json({ status: 'failed', message: dbErr.message });
    }
  });
});

// GET /documents — ambil semua dokumen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');
    return res.status(200).json({
      status: 'success',
      data: { documents: result.rows },
    });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
});

// GET /documents/:id — serve/download PDF
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Document not found' });
    }

    const doc = result.rows[0];
    const filePath = path.resolve(__dirname, '../../uploads/documents', doc.filename);

    // Wajib: Content-Type: application/pdf + Content-Disposition
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
    res.sendFile(filePath, (err) => {
      if (err) res.status(404).json({ status: 'failed', message: 'File not found on disk' });
    });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
});

// DELETE /documents/:id — hapus dokumen (wajib auth)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Document not found' });
    }

    // Hapus file fisik
    const filePath = path.resolve(__dirname, '../../uploads/documents', result.rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.status(200).json({ status: 'success', message: 'Document deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
});

export default router;
```

### 4.4 Daftarkan route di `app.js`

```js
import documentRoutes from './src/routes/document.routes.js';

app.use('/documents', documentRoutes);
```

---

## 🔧 FASE 5 — Implementasi Kriteria 2: Caching Redis

### ⚠️ Hal Kritis dari Collection Postman

Collection `[Mandatory] Cache` menguji semua hal berikut secara otomatis:

**Header wajib di SETIAP response:**
- Jika dari DB → `X-Data-Source: database`
- Jika dari cache → `X-Data-Source: cache`

**Endpoint yang WAJIB di-cache (diuji cache miss → cache hit):**

| Endpoint | Cache Key Rekomendasi |
|---|---|
| `GET /companies/:id` | `company:{id}` |
| `GET /users/:id` | `user:{id}` |
| `GET /applications/:id` | `application:{id}` |
| `GET /applications/user/:userId` | `applications:user:{userId}` |
| `GET /applications/job/:jobId` | `applications:job:{jobId}` |
| `GET /bookmarks` | `bookmarks:{userId}` |

**Cache invalidation yang diuji:**

| Event | Cache yang harus dihapus |
|---|---|
| `PUT /companies/:id` | `company:{id}` |
| `POST /applications` | `applications:user:{userId}` dan `applications:job:{jobId}` |
| `PUT /applications/:id` | `application:{id}`, `applications:user:{userId}`, `applications:job:{jobId}` |

### 5.1 Buat `src/config/redis.js`

```js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));

export default redis;
```

### 5.2 Buat `src/middlewares/cache.middleware.js`

```js
import redis from '../config/redis.js';

// Middleware: cek cache dulu, set header X-Data-Source di semua response
export const cacheMiddleware = (keyFn, ttl = 3600) => async (req, res, next) => {
  const key = keyFn(req);
  try {
    const cached = await redis.get(key);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    console.error('Cache read error:', err);
  }

  // Belum ada cache → dari database, set header database
  res.setHeader('X-Data-Source', 'database');

  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    // Hanya simpan ke cache jika response sukses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await redis.setex(key, ttl, JSON.stringify(data));
      } catch (err) {
        console.error('Cache write error:', err);
      }
    }
    return originalJson(data);
  };

  next();
};

// Helper: hapus satu atau beberapa cache key
export const deleteCache = async (...keys) => {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};
```

### 5.3 Terapkan cache di setiap route yang relevan

**Contoh `companies.routes.js`:**

```js
import { cacheMiddleware, deleteCache } from '../middlewares/cache.middleware.js';

// GET /companies/:id
router.get('/:id', cacheMiddleware((req) => `company:${req.params.id}`, 3600), getCompanyById);

// PUT /companies/:id — invalidate setelah update
router.put('/:id', authMiddleware, async (req, res) => {
  // ... logika update ...
  await deleteCache(`company:${req.params.id}`);
  res.json({ status: 'success', ... });
});

// DELETE /companies/:id — invalidate setelah delete
router.delete('/:id', authMiddleware, async (req, res) => {
  await deleteCache(`company:${req.params.id}`);
  // ... logika delete ...
});
```

**Contoh `applications.routes.js`:**

```js
// GET /applications/:id
router.get('/:id', authMiddleware,
  cacheMiddleware((req) => `application:${req.params.id}`, 3600),
  getApplicationById
);

// GET /applications/user/:userId
router.get('/user/:userId', authMiddleware,
  cacheMiddleware((req) => `applications:user:${req.params.userId}`, 3600),
  getApplicationsByUser
);

// GET /applications/job/:jobId
router.get('/job/:jobId', authMiddleware,
  cacheMiddleware((req) => `applications:job:${req.params.jobId}`, 3600),
  getApplicationsByJob
);

// POST /applications — invalidate list cache setelah create
router.post('/', authMiddleware, async (req, res) => {
  // ... logika create, dapatkan userId dan jobId dari body/db ...
  const { user_id, job_id } = req.body;
  await deleteCache(
    `applications:user:${user_id}`,
    `applications:job:${job_id}`
  );
  res.status(201).json({ ... });
});

// PUT /applications/:id — invalidate detail + list cache
router.put('/:id', authMiddleware, async (req, res) => {
  // ... dapatkan userId dan jobId dari DB berdasarkan :id ...
  await deleteCache(
    `application:${req.params.id}`,
    `applications:user:${app.user_id}`,
    `applications:job:${app.job_id}`
  );
  res.json({ ... });
});
```

**Contoh `bookmarks.routes.js`:**

```js
// GET /bookmarks
router.get('/', authMiddleware,
  cacheMiddleware((req) => `bookmarks:${req.user.id}`, 3600),
  getBookmarks
);

// POST + DELETE /bookmarks — invalidate list cache
router.post('/', authMiddleware, async (req, res) => {
  // ... logika create bookmark ...
  await deleteCache(`bookmarks:${req.user.id}`);
  res.status(201).json({ ... });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  // ... logika delete bookmark ...
  await deleteCache(`bookmarks:${req.user.id}`);
  res.json({ ... });
});
```

> ⚠️ `GET /users/:id` juga harus di-cache dan di-invalidate saat `PUT /users/:id`.

---

## 🔧 FASE 6 — Implementasi Kriteria 3: RabbitMQ + Nodemailer

### ⚠️ Hal Kritis dari Collection Postman

Folder `[RabbitMQ] Feature Test` membuat data dari nol dengan flow:

1. Register user **owner** (`aras@dicoding.com`) → set `ownerUserId`
2. Register user **applicant** (`applicant@example.com`) → set `applicantUserId`
3. Login sebagai owner → set `ownerAccessToken`
4. Login sebagai applicant → set `applicantAccessToken`
5. Owner buat **category** → set `mqCategoryId`
6. Owner buat **company** → set `mqCompanyId`
7. Owner buat **job** menggunakan `mqCompanyId` + `mqCategoryId` → set `mqJobId`
8. Applicant **POST /applications** dengan `mqJobId` → set `mqApplicationId` + trigger publish ke RabbitMQ
9. Test: unauthenticated apply → `401`
10. Test: apply job tidak ada → `400/404/500`
11. Cleanup: Delete application, job, company, category

### 6.1 Buat `src/config/rabbitmq.js` (Publisher)

```js
import amqplib from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  const conn = await amqplib.connect({
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });
  channel = await conn.createChannel();
  await channel.assertQueue('application_created', { durable: true });
  console.log('✅ RabbitMQ publisher connected');
};

export const publishApplicationCreated = async (applicationId) => {
  if (!channel) {
    console.warn('RabbitMQ channel not ready');
    return;
  }
  const payload = JSON.stringify({ application_id: applicationId });
  channel.sendToQueue('application_created', Buffer.from(payload), { persistent: true });
  console.log(`📤 Published: application_id=${applicationId}`);
};
```

### 6.2 Panggil `connectRabbitMQ` saat server start

```js
// Di app.js / server.js
import { connectRabbitMQ } from './src/config/rabbitmq.js';

const start = async () => {
  await connectRabbitMQ();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
```

### 6.3 Publish saat kandidat buat lamaran

Di `application.controller.js` atau handler POST /applications:

```js
import { publishApplicationCreated } from '../config/rabbitmq.js';

// Setelah INSERT berhasil, SEBELUM kirim response:
await publishApplicationCreated(newApplication.id);
// Jangan publish jika insert gagal (non-existent job, unauthenticated, dll)
```

### 6.4 Buat `src/consumer/application.consumer.js`

```js
import 'dotenv/config';
import amqplib from 'amqplib';
import nodemailer from 'nodemailer';
import pool from '../config/db.js'; // sesuaikan path

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const startConsumer = async () => {
  const conn = await amqplib.connect({
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });

  const channel = await conn.createChannel();
  await channel.assertQueue('application_created', { durable: true });
  channel.prefetch(1);

  console.log('🐇 Consumer aktif, menunggu pesan...');

  channel.consume('application_created', async (msg) => {
    if (!msg) return;

    const { application_id } = JSON.parse(msg.content.toString());
    console.log(`📥 Menerima: application_id=${application_id}`);

    try {
      // Query: cari pemilik job (owner), bukan pelamar
      // Sesuaikan tabel/kolom dengan schema proyek v1 kamu
      const result = await pool.query(
        `SELECT
            a.created_at AS apply_date,
            applicant.email AS applicant_email,
            applicant.name AS applicant_name,
            owner.email AS owner_email
         FROM applications a
         JOIN users applicant ON applicant.id = a.user_id
         JOIN jobs j ON j.id = a.job_id
         JOIN companies c ON c.id = j.company_id
         JOIN users owner ON owner.id = c.user_id
         WHERE a.id = $1`,
        [application_id]
      );

      if (result.rows.length === 0) {
        console.warn(`Application ${application_id} tidak ditemukan di DB`);
        channel.ack(msg);
        return;
      }

      const { applicant_email, applicant_name, apply_date, owner_email } = result.rows[0];

      await transporter.sendMail({
        from: `"OpenJob Notification" <${process.env.MAIL_USER}>`,
        to: owner_email, // ← kirim ke pemilik job, BUKAN pelamar
        subject: '📩 Ada pelamar baru untuk lowongan Anda!',
        html: `
          <h2>Notifikasi Lamaran Baru</h2>
          <p>Seseorang telah melamar ke lowongan Anda di OpenJob:</p>
          <ul>
            <li><strong>Nama Pelamar:</strong> ${applicant_name}</li>
            <li><strong>Email Pelamar:</strong> ${applicant_email}</li>
            <li><strong>Tanggal Melamar:</strong> ${new Date(apply_date).toLocaleString('id-ID')}</li>
          </ul>
          <p>Silakan login ke OpenJob untuk meninjau lamaran ini.</p>
        `,
      });

      console.log(`✅ Email notifikasi terkirim ke ${owner_email}`);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Consumer error:', err.message);
      channel.nack(msg, false, false);
    }
  });
};

startConsumer().catch(console.error);
```

### 6.5 Tambahkan script consumer di `package.json`

```json
{
  "scripts": {
    "start": "node src/server.js",
    "consumer": "node src/consumer/application.consumer.js"
  }
}
```

---

## 🧪 FASE 7 — Pengujian dengan Postman

### 7.1 Setup Awal

1. Import collection **`[271] OpenJob API Test V2`** ke Postman
2. Import environment **`OpenJob API`** ke Postman
3. Aktifkan environment **OpenJob API** di pojok kanan atas Postman
4. Pastikan server berjalan di port **3000** (`PORT=3000` di `.env`)
5. Buka terminal kedua, jalankan consumer:

```bash
npm run consumer
```

### 7.2 Cara Jalankan Collection Runner

**Buka Collection Runner:** Klik kanan nama collection → **Run collection**

**⚠️ WAJIB: Non-aktifkan folder `[Mandatory] Documents`**

Di Collection Runner, **hilangkan centang** pada folder `[Mandatory] Documents` sebelum klik Run. Folder ini harus diuji secara manual.

Urutan folder yang boleh dijalankan di runner (jangan ubah urutan):
1. `[Mandatory] Users`
2. `Companies`
3. `Categories`
4. `Jobs`
5. `Applications`
6. `Bookmarks`
7. `Authentications`
8. `Profile`
9. `[Mandatory] Cache`
10. `[RabbitMQ] Feature Test`

### 7.3 Panduan Pengujian Manual — Folder `[Mandatory] Documents`

Jalankan request-request ini **satu per satu secara manual** (bukan lewat runner):

**Step 1 — Setup:** Jalankan `[Setup] - Login for Documents Test`
→ Otomatis mengisi `documentsAccessToken` di environment.

**Step 2 — Test tanpa auth:** Jalankan `Upload Document without Authentication`
→ Ekspektasi: `401 Unauthorized`

**Step 3 — Test tanpa file:** Jalankan `Upload Document without File`
→ Ekspektasi: `400`, message mengandung `"required"`

**Step 4 — Test file non-PDF:** Jalankan `Upload Document with Non-PDF File`
→ Arahkan ke file `.txt` atau `.jpg` di komputer kamu
→ Ekspektasi: `400`, message mengandung `"File is required"`

**Step 5 — Upload PDF valid:** Jalankan `Upload Document with Valid PDF`
→ Ubah `src` file ke path file PDF valid di komputer kamu (≤ 5 MB)
→ Ekspektasi: `201`, response punya `documentId`, `filename`, `originalName`, `size`
→ `documentId` otomatis tersimpan di environment

**Step 6 — Get All Documents:** Jalankan `Get All Documents`
→ Ekspektasi: `200`, `data.documents` berupa array dengan minimal 1 item

**Step 7 — Get by Invalid Id:** Jalankan `Get Document by Id with Invalid Id`
→ Ekspektasi: `404`

**Step 8 — View/Download PDF:** Jalankan `Get Document by Id (View/Download PDF)`
→ Ekspektasi: `200`, `Content-Type: application/pdf`, ada header `Content-Disposition`

**Step 9 — Delete tanpa auth:** Jalankan `Delete Document without Authentication`
→ Ekspektasi: `401`

**Step 10 — Delete valid:** Jalankan `Delete Document with Valid Id`
→ Ekspektasi: `200`, `status: 'success'`

### 7.4 Verifikasi Cache via Redis CLI

Setelah menjalankan folder `[Mandatory] Cache`, cek via terminal:

```bash
# Lihat semua cache key yang tersimpan
redis-cli KEYS "*"

# Cek TTL (harus sekitar 3600 detik)
redis-cli TTL "company:some-id"

# Lihat isi cache
redis-cli GET "company:some-id"

# Setelah update company, key harus sudah hilang (invalidated)
redis-cli EXISTS "company:some-id"   # harus return 0
```

### 7.5 Verifikasi RabbitMQ

Setelah folder `[RabbitMQ] Feature Test` dijalankan:

- **Terminal consumer** harus tampilkan log seperti:
  ```
  📥 Menerima: application_id=xxx
  ✅ Email notifikasi terkirim ke aras@dicoding.com
  ```
- **Inbox email owner** (`aras@dicoding.com`) harus menerima email berisi nama pelamar, email pelamar, dan tanggal lamaran

Cek queue via Management UI: buka `http://localhost:15672` → tab **Queues** → cek `application_created`.

### 7.6 Checklist Test Sebelum Submit

**Kriteria 1 — Documents:**
- [ ] `POST /documents` tanpa auth → `401`
- [ ] `POST /documents` tanpa file → `400`, message ada kata "required"
- [ ] `POST /documents` file non-PDF → `400`, message ada "File is required"
- [ ] `POST /documents` PDF valid → `201`, response punya `documentId`, `filename`, `originalName`, `size`
- [ ] `GET /documents` → `200`, `data.documents` berupa array
- [ ] `GET /documents/xxx` → `404`
- [ ] `GET /documents/:id` → `200`, Content-Type `application/pdf`, ada header `Content-Disposition`
- [ ] `DELETE /documents/:id` tanpa auth → `401`
- [ ] `DELETE /documents/:id` valid → `200`

**Kriteria 2 — Cache:**
- [ ] `GET /companies/:id` pertama → `X-Data-Source: database`
- [ ] `GET /companies/:id` kedua (hit) → `X-Data-Source: cache`
- [ ] `GET /users/:id` pertama → `X-Data-Source: database`
- [ ] `GET /users/:id` kedua → `X-Data-Source: cache`
- [ ] `GET /applications/:id` pertama → `X-Data-Source: database`
- [ ] `GET /applications/:id` kedua → `X-Data-Source: cache`
- [ ] `GET /applications/user/:userId` pertama → `X-Data-Source: database`
- [ ] `GET /applications/user/:userId` kedua → `X-Data-Source: cache`
- [ ] `GET /applications/job/:jobId` pertama → `X-Data-Source: database`
- [ ] `GET /applications/job/:jobId` kedua → `X-Data-Source: cache`
- [ ] `GET /bookmarks` pertama → `X-Data-Source: database`
- [ ] `GET /bookmarks` kedua → `X-Data-Source: cache`
- [ ] `PUT /companies/:id` → GET setelahnya `X-Data-Source: database` (invalidated)
- [ ] `POST /applications` → GET list setelahnya `X-Data-Source: database` (invalidated)
- [ ] `PUT /applications/:id` → GET detail setelahnya `X-Data-Source: database` (invalidated)

**Kriteria 3 — RabbitMQ:**
- [ ] `POST /applications` (authenticated, job valid) → consumer menerima pesan
- [ ] Consumer mengirim email ke **pemilik job** (bukan pelamar)
- [ ] Email berisi: nama pelamar, email pelamar, tanggal lamaran
- [ ] Apply tanpa auth → `401`, tidak ada publish ke queue
- [ ] Apply dengan job tidak ada → `400/404`, tidak ada publish ke queue

---

## 📦 FASE 8 — Persiapan Submission

### 8.1 Final Checklist

- [ ] Semua test mandatory di Postman ✅ tidak ada yang error
- [ ] Folder `[Mandatory] Documents` sudah diuji manual ✅
- [ ] Header `X-Data-Source` selalu ada di setiap response endpoint yang di-cache
- [ ] File `.env` — boleh tidak disertakan, **tapi nama variabel harus persis sama**
- [ ] Folder `uploads/documents/` ada di dalam proyek
- [ ] File `src/consumer/application.consumer.js` ada
- [ ] `package.json` punya script `"consumer"` untuk menjalankan consumer

### 8.2 Bersihkan dan ZIP

```bash
# Hapus node_modules (WAJIB)
rm -rf node_modules

# Opsional: hapus .env jika tidak ingin sertakan kredensial
# rm .env

# ZIP dari luar folder proyek
cd ..
zip -r openjob-api-v2.zip nama-folder-proyek/
```

### 8.3 Submit ke Dicoding

Upload file `.zip` ke halaman submission kelas **Back-End Fundamental dengan JavaScript**.

---

## 🏆 Ringkasan Target Poin

| Kriteria | Yang Harus Dipenuhi | Poin |
|---|---|---|
| 1 — Upload PDF | Multer, validasi MIME + size, simpan ke tabel, serve PDF dengan header yang benar | 4 |
| 2 — Caching Redis | Cache 6 endpoint, `X-Data-Source` header di semua response, invalidation lengkap | 4 |
| 3 — RabbitMQ | Publish saat create application, consumer email via Nodemailer, data dari DB | 4 |
| **Total** | | **12 / 12** |
| **Nilai Akhir** | | **4.0 = ⭐⭐⭐⭐⭐** |

---

*Semangat, Baji! Submission terakhir ini, habis ini lulus! 🚀*
