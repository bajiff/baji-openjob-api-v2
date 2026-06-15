import express from 'express';
import { cacheMiddleware } from '../../middlewares/cache.js';

const routes = (handler) => {
  const router = express.Router();
  
  router.post('/', handler.postUserHandler);
  router.get('/:id', cacheMiddleware((req) => `user:${req.params.id}`, 3600), handler.getUserByIdHandler);
  
  return router;
};

export default routes;