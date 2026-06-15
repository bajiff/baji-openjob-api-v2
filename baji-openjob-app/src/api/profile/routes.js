import express from 'express';
import authMiddleware from '../../middlewares/auth.js';

const routes = (handler) => {
  const router = express.Router();
  
  router.get('/', authMiddleware, handler.getProfileHandler);
  router.get('/applications', authMiddleware, handler.getApplicationsHandler);
  router.get('/bookmarks', authMiddleware, handler.getBookmarksHandler);
  
  return router;
};

export default routes;