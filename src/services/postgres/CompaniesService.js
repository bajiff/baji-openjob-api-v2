import pool from './pool.js';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

export default class CompaniesService {
  async addCompany({ name, description, userId }) {
    const id = `company-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO companies (id, name, description, user_id) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, description, userId],
    };

    const result = await pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Company gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getCompanies() {
    const result = await pool.query('SELECT id, name, description FROM companies');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      location: 'Jakarta',
      description: row.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  async getCompanyById(id) {
    const query = {
      text: 'SELECT id, name, description FROM companies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Company tidak ditemukan');
    }

    return result.rows[0];
  }

  async editCompanyById(id, { name, description }) {
    const query = {
      text: 'UPDATE companies SET name = $1, description = $2 WHERE id = $3 RETURNING id',
      values: [name, description, id],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui company. Id tidak ditemukan');
    }
  }

  async deleteCompanyById(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Company gagal dihapus. Id tidak ditemukan');
    }
  }
}