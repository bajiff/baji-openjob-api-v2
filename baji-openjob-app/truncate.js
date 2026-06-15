import 'dotenv/config';
import pool from './src/services/postgres/pool.js';

const truncateDatabase = async () => {
  try {
    console.log('⏳ Sedang menyapu bersih database...');
    
    await pool.query('TRUNCATE TABLE users, companies, categories, jobs, applications, documents, bookmarks CASCADE;');
    
    console.log('✅ Database berhasil dibersihkan!');

    console.log('⏳ Sedang menyapu bersih Redis cache...');
    const redis = (await import('./src/config/redis.js')).default;
    if (redis && redis.flushall) {
      await redis.flushall();
      console.log('✅ Redis cache berhasil dibersihkan!');
      redis.disconnect();
    }
    
    console.log('🚀 Siap untuk testing Postman.');
  } catch (error) {
    console.error('❌ Gagal membersihkan database:', error.message);
  } finally {
    await pool.end();
  }
};

truncateDatabase();