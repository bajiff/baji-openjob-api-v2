import express from 'express';
import authMiddleware from '../../middlewares/auth.js';

const routes = (handler) => {
  const router = express.Router();
  
  router.get('/', handler.getCategoriesHandler);
  router.get('/:id', handler.getCategoryByIdHandler);

  router.post('/', authMiddleware, handler.postCategoryHandler);
  router.put('/:id', authMiddleware, handler.putCategoryByIdHandler);
  router.delete('/:id', authMiddleware, handler.deleteCategoryByIdHandler);
  
  return router;
};

export default routes;