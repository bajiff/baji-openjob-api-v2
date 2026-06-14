import pool from './pool.js';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

const mapDBToModel = (model) => ({
  id: model.id,
  title: model.title,
  description: model.description,
  company_id: model.company_id, 
  categoryId: model.category_id, 
  jobType: model.job_type, 
  experienceLevel: model.experience_level,
  locationType: model.location_type,
  locationCity: model.location_city,
  salaryMin: model.salary_min,
  salaryMax: model.salary_max,
  isSalaryVisible: model.is_salary_visible,
  status: model.status,
});

export default class JobsService {

  constructor() {
    this._pool = pool;
  }

  async addJob({ 
    company_id,
    category_id,
    title,
    description, 
    job_type,
    experience_level,
    status,
    location_type, 
    location_city = null,
    salary_min = null,
    salary_max = null, 
    is_salary_visible = null
  }) {
    const id = `job-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO jobs (
               id, company_id, category_id, title, description, 
               job_type, experience_level, location_type, 
               location_city, salary_min, salary_max, 
               is_salary_visible, status
             ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
             ) RETURNING id`,
      values: [
        id, company_id, category_id, title, description, 
        job_type, experience_level, location_type, 
        location_city, salary_min, salary_max, 
        is_salary_visible, status
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Job gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getJobs(title, companyName) {
    let text = `SELECT jobs.*
                FROM jobs 
                JOIN companies ON jobs.company_id = companies.id 
                WHERE 1=1`; 
    const values = [];

    if (title) {
      values.push(`%${title}%`);
      text += ` AND jobs.title ILIKE $${values.length}`;
    }

    if (companyName) {
      values.push(`%${companyName}%`);
      text += ` AND companies.name ILIKE $${values.length}`;
    }

    const query = { text, values };
    const result = await this._pool.query(query); 

    return result.rows;
  }

  async getJobById(id) {
    const query = {
      text: 'SELECT * FROM jobs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lowongan tidak ditemukan'); 
    }

    return mapDBToModel(result.rows[0]);
  }

  async getJobsByCompanyId(company_id) {
    const query = {
      text: 'SELECT * FROM jobs WHERE company_id = $1',
      values: [company_id],
    };

    const result = await this._pool.query(query);

    return result.rows; 
  }

  async getJobsByCategoryId(categoryId) {
    const query = {
      text: 'SELECT * FROM jobs WHERE category_id = $1',
      values: [categoryId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async editJobById(id, { title = null, description = null, company_id = null, category_id = null, job_type = null, experience_level = null, location_type = null, location_city = null, salary_min = null, salary_max = null, is_salary_visible = null, status = null }) {
    const query = {
      text: `UPDATE jobs SET 
               company_id = COALESCE($1::VARCHAR, company_id),
               category_id = COALESCE($2::VARCHAR, category_id),
               title = COALESCE($3::VARCHAR, title),
               description = COALESCE($4::TEXT, description),
               job_type = COALESCE($5::VARCHAR, job_type),
               experience_level = COALESCE($6::VARCHAR, experience_level),
               location_type = COALESCE($7::VARCHAR, location_type),
               location_city = COALESCE($8::VARCHAR, location_city),
               salary_min = COALESCE($9::INTEGER, salary_min),
               salary_max = COALESCE($10::INTEGER, salary_max),
               is_salary_visible = COALESCE($11::BOOLEAN, is_salary_visible),
               status = COALESCE($12::VARCHAR, status)
             WHERE id = $13 RETURNING id`,
      values: [
        company_id, category_id, title, description,
        job_type, experience_level, location_type,
        location_city, salary_min, salary_max,
        is_salary_visible, status, id
      ],
    };
   
    try {
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Gagal memperbarui lowongan. Id tidak ditemukan');
      }
    } catch (error) {
      if (error.code === '23503') {
        throw new InvariantError('Gagal memperbarui lowongan. Company ID atau Category ID tidak valid.');
      }
      throw error;
    }
  }

  async deleteJobById(id) {
    const query = {
      text: 'DELETE FROM jobs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lowongan gagal dihapus. Id tidak ditemukan');
    }
  }
  

  async addBookmark(user_id, job_id) {
    const id = `bookmark-${nanoid(16)}`; 
    const query = {
      text: 'INSERT INTO bookmarks VALUES($1, $2, $3) RETURNING id',
      values: [id, user_id, job_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error('Gagal menambahkan bookmark');
    }

    return result.rows[0].id;
  }

  async getBookmark(bookmark_id) {
    const query = {
      text: 'SELECT * FROM bookmarks WHERE id = $1',
      values: [bookmark_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Bookmark tidak ditemukan');
    }

    return result.rows[0];
  }

  async getBookmarks(user_id) {
    const query = {
      text: 'SELECT * FROM bookmarks WHERE user_id = $1',
      values: [user_id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteBookmark(user_id, job_id) {
    const query = {
      text: 'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING id',
      values: [user_id, job_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Bookmark gagal dihapus. Id tidak ditemukan');
    }
  }

  async getBookmarkedJobs(user_id) {
    const query = {
      text: `SELECT jobs.* FROM jobs 
              JOIN bookmarks ON jobs.id = bookmarks.job_id 
              WHERE bookmarks.user_id = $1`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}