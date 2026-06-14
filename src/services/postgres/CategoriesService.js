import pool from './pool.js';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

export default class CategoriesService {
  
  constructor() {
    this._pool = pool; 
  }

  async addCategory({ name }) {
    const id = `category-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO categories VALUES($1, $2) RETURNING id',
      values: [id, name],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Kategori gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getCategories() {
    const result = await pool.query('SELECT id, name FROM categories');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  async getCategoryById(id) {
    const query = {
      text: 'SELECT id, name FROM categories WHERE id = $1', 
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Kategori tidak ditemukan');
    }

    return result.rows[0];
  }

  async editCategoryById(id, { name }) {
    const query = {
      text: 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id',
      values: [name, id],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui kategori. Id tidak ditemukan');
    }
  }

  async deleteCategoryById(id) {
    const query = {
      text: 'DELETE FROM categories WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Kategori gagal dihapus. Id tidak ditemukan');
    }
  }
}