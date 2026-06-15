export default class JobsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postJobHandler = this.postJobHandler.bind(this);
    this.getJobsHandler = this.getJobsHandler.bind(this);
    this.getJobByIdHandler = this.getJobByIdHandler.bind(this);
    this.putJobByIdHandler = this.putJobByIdHandler.bind(this);
    this.deleteJobByIdHandler = this.deleteJobByIdHandler.bind(this);
    this.getJobsByCompanyIdHandler = this.getJobsByCompanyIdHandler.bind(this);
    this.getJobsByCategoryIdHandler = this.getJobsByCategoryIdHandler.bind(this);
    this.postBookmarkHandler = this.postBookmarkHandler.bind(this);
    this.getBookmarkedJobsHandler = this.getBookmarkedJobsHandler.bind(this);
    this.getBookmarkByIdHandler = this.getBookmarkByIdHandler.bind(this);
    this.getBookmarksHandler = this.getBookmarksHandler.bind(this);
    this.deleteBookmarkHandler = this.deleteBookmarkHandler.bind(this);

  }

  async postJobHandler(req, res, next) {
    try {
      this._validator.validateJobPayload(req.body);

      const { 
        company_id, category_id, title, description, 
        job_type, experience_level, location_type, 
        location_city, salary_min, salary_max, 
        is_salary_visible, status 
      } = req.body;

      const jobId = await this._service.addJob({
        company_id, category_id, title, description, 
        job_type, experience_level, location_type, 
        location_city, salary_min, salary_max, 
        is_salary_visible, status
      });

      return res.status(201).json({
        status: 'success',
        message: 'Job berhasil ditambahkan',
        data: {
          id: jobId, 
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsHandler(req, res, next) { try {
      const { title, 'company-name': companyName } = req.query;
      const jobs = await this._service.getJobs(title, companyName);
      return res.status(200).json({
        status: 'success',
        data: {
          jobs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const job = await this._service.getJobById(id);

      return res.status(200).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsByCompanyIdHandler(req, res, next) {
    try {
      const { companyId } = req.params; 
      
      const jobs = await this._service.getJobsByCompanyId(companyId);

      return res.status(200).json({
        status: 'success',
        data: {
          jobs, 
        },
      });
    } catch (error) {
      next(error);
    }
  }
    async getJobsByCategoryIdHandler(req, res, next) {
    try {
      const { categoryId } = req.params;
      
      const jobs = await this._service.getJobsByCategoryId(categoryId);

      return res.status(200).json({
        status: 'success',
        data: {
          jobs, 
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async putJobByIdHandler(req, res, next) {
    try {
      const payload = req.body || {};
      this._validator.validateUpdateJobPayload(req.body);

      const { id } = req.params;

      await this._service.editJobById(id, payload);

      return res.status(200).json({
        status: 'success',
        message: 'Lowongan pekerjaan berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }


  async deleteJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteJobById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Lowongan pekerjaan berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getBookmarkedJobsHandler(req, res, next) {
    try {
      const { userId } = req.user;
      const jobs = await this._service.getBookmarkedJobs(userId);

      return res.status(200).json({
        status: 'success',
        data: {
          jobs,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  

  async postBookmarkHandler(req, res, next) {
    try {
      const { id: job_id } = req.params;
      const { id: user_id } = req.user; 

      const bookmarkId = await this._service.addBookmark(user_id, job_id);

      // Invalidate cache when new bookmark is added
      const { deleteCache } = await import('../../middlewares/cache.js');
      await deleteCache(`bookmarks:${user_id}`);

      return res.status(201).json({
        status: 'success',
        message: 'Bookmark berhasil ditambahkan',
        data: {
          id: bookmarkId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarkByIdHandler(req, res, next) {
    try {
      const { bookmarkId } = req.params;
      const bookmark = await this._service.getBookmark(bookmarkId);

      return res.status(200).json({
        status: 'success',
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarksHandler(req, res, next) {
    try {
      const { id: user_id } = req.user; 

      const bookmarks = await this._service.getBookmarks(user_id);

      return res.status(200).json({
        status: 'success',
        data: {
          bookmarks,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteBookmarkHandler(req, res, next) {
    try {
      const { id: job_id } = req.params;
      const { id: user_id } = req.user;

      await this._service.deleteBookmark(user_id, job_id);

      return res.status(200).json({
        status: 'success',
        message: 'Bookmark berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}