import redis from '../config/redis.js';

/**
 * Cache middleware: cek cache dulu, set header X-Data-Source di semua response.
 * @param {Function} keyFn - Function yang menerima (req) dan return cache key string.
 * @param {number} ttl - Time to live dalam detik (default 3600).
 */
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

  // Belum ada cache → data dari database
  res.setHeader('X-Data-Source', 'database');

  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    // Simpan ke cache hanya jika response sukses
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

/**
 * Helper: hapus satu atau beberapa cache key.
 */
export const deleteCache = async (...keys) => {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};
