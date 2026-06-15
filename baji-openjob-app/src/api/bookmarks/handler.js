import { deleteCache } from '../../middlewares/cache.js';

export default class BookmarksHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Ritual wajib: Binding context
    this.getBookmarksHandler = this.getBookmarksHandler.bind(this);
    this.getBookmarkByIdHandler = this.getBookmarkByIdHandler.bind(this);
    this.deleteBookmarkHandler = this.deleteBookmarkHandler.bind(this);
  }

  async getBookmarksHandler(req, res, next) {
    try {
      const { id: user_id } = req.user;
      
      // Mengambil semua bookmark milik user yang sedang login
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

  async getBookmarkByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      
      // Mengambil detail 1 bookmark berdasarkan ID-nya
      const bookmark = await this._service.getBookmarkById(id);

      return res.status(200).json({
        status: 'success',
        data: {
          bookmark,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBookmarkHandler(req, res, next) {
    try {
      const { id } = req.params;
      
      // Menghapus bookmark berdasarkan ID
      await this._service.deleteBookmarkById(id);

      // Invalidate cache
      await deleteCache(`bookmarks:${req.user.id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Bookmark berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}