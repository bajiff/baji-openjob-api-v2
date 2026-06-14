import CategoriesHandler from './handler.js';
import routes from './routes.js';

const createCategoriesApi = (service, validator) => {
  const categoriesHandler = new CategoriesHandler(service, validator);
  return routes(categoriesHandler);
};

export default createCategoriesApi;