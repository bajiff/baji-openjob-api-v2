import DocumentsHandler from './handler.js';
import routes from './routes.js';

const createDocumentsApi = (documentsService) => {
  const handler = new DocumentsHandler(documentsService);
  return routes(handler);
};

export default createDocumentsApi;
