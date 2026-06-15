export default class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.getCategoryByIdHandler = this.getCategoryByIdHandler.bind(this);
    this.putCategoryByIdHandler = this.putCategoryByIdHandler.bind(this);
    this.deleteCategoryByIdHandler = this.deleteCategoryByIdHandler.bind(this);
  }

  async postCategoryHandler(req, res, next) {
    try {
      const payload = req.body || {};
      this._validator.validateCategoryPayload(payload);

      const { name } = payload;
      const categoryId = await this._service.addCategory({ name });

      return res.status(201).json({
        status: 'success',
        message: 'Kategori berhasil ditambahkan',
        data: {
          id:categoryId
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesHandler(req, res, next) {
    try {
      const categories = await this._service.getCategories();
      return res.json({
        status: 'success',
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const category = await this._service.getCategoryById(id);

      return res.json({
        status: 'success',
        data: {
          id: category.id,
          name: category.name,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putCategoryByIdHandler(req, res, next) {
    try {
      const payload = req.body || {};
      this._validator.validateCategoryPayload(payload);

      const { id } = req.params;
      const { name } = payload;

      await this._service.editCategoryById(id, { name });

      return res.json({
        status: 'success',
        message: 'Kategori berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategoryByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteCategoryById(id);

      return res.json({
        status: 'success',
        message: 'Kategori berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}