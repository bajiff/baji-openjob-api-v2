import express from 'express';
import authMiddleware from '../../middlewares/auth.js';

const routes = (handler) => {
  const router = express.Router();

  router.post('/', authMiddleware, handler.postDocumentHandler);
  router.get('/', handler.getDocumentsHandler);
  router.get('/:id', handler.getDocumentByIdHandler);
  router.delete('/:id', authMiddleware, handler.deleteDocumentByIdHandler);

  return router;
};

export default routes;
