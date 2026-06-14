import pool from './pool.js';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/NotFoundError.js';

export default class DocumentsService {
  constructor() {
    this._pool = pool;
  }

  async addDocument({ userId, filename, originalName, size }) {
    const id = `document-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO documents (id, user_id, filename, original_name, size) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, userId, filename, originalName, size],
    };

    const result = await this._pool.query(query);
    return {
      documentId: result.rows[0].id,
      filename,
      originalName,
      size,
    };
  }

  async getDocuments() {
    const result = await this._pool.query(
      'SELECT * FROM documents ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getDocumentById(id) {
    const query = {
      text: 'SELECT * FROM documents WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Document not found');
    }

    return result.rows[0];
  }

  async deleteDocumentById(id) {
    const query = {
      text: 'DELETE FROM documents WHERE id = $1 RETURNING *',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Document not found');
    }

    return result.rows[0];
  }
}
