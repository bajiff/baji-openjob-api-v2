import express from 'express';
import authMiddleware from '../../middlewares/auth.js';

const routes = (handler) => {
  const router = express.Router();
  
  router.post('/:id/bookmark', authMiddleware, handler.postBookmarkHandler);
  router.get('/:id/bookmark/:bookmarkId', authMiddleware, handler.getBookmarkByIdHandler);
  router.delete('/:id/bookmark', authMiddleware, handler.deleteBookmarkHandler);
  
  router.get('/', handler.getJobsHandler);
  router.get('/bookmarks', authMiddleware, handler.getBookmarkedJobsHandler);
  router.get('/company/:companyId', handler.getJobsByCompanyIdHandler);
  router.get('/category/:categoryId', handler.getJobsByCategoryIdHandler);
  router.get('/:id', handler.getJobByIdHandler);
  
  router.post('/', authMiddleware, handler.postJobHandler);
  router.put('/:id', authMiddleware, handler.putJobByIdHandler);
  router.delete('/:id', authMiddleware, handler.deleteJobByIdHandler);
  
  return router;
};

export default routes;