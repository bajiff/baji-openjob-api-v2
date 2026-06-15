import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import { cacheMiddleware } from '../../middlewares/cache.js';

const routes = (handler) => {
  const router = express.Router();
  
  router.get('/', authMiddleware, cacheMiddleware((req) => `bookmarks:${req.user.id}`, 3600), handler.getBookmarksHandler);
  
  router.get('/:id', authMiddleware, handler.getBookmarkByIdHandler);
  
  router.delete('/:id', authMiddleware, handler.deleteBookmarkHandler);
  
  return router;
};

export default routes;