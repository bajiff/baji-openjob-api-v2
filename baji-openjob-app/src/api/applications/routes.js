import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import { cacheMiddleware } from '../../middlewares/cache.js';

const routes = (handler) => {
  const router = express.Router();
  
  router.get('/', authMiddleware, handler.getApplicationsHandler);
  router.get('/user/:user_id', authMiddleware, cacheMiddleware((req) => `applications:user:${req.params.user_id}`, 3600), handler.getApplicationsByUserIdHandler);
  router.get('/job/:job_id', authMiddleware, cacheMiddleware((req) => `applications:job:${req.params.job_id}`, 3600), handler.getApplicationsByJobIdHandler);
  router.get('/:id', authMiddleware, cacheMiddleware((req) => `application:${req.params.id}`, 3600), handler.getApplicationByIdHandler);

  router.put('/:id', authMiddleware, handler.putApplicationByIdHandler);
  router.post('/', authMiddleware, handler.postApplicationHandler);
  router.delete('/:id', authMiddleware, handler.deleteApplicationByIdHandler);
  
  return router;
};

export default routes;