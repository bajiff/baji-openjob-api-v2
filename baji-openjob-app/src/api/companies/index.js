import CompaniesHandler from './handler.js';
import routes from './routes.js';

const createCompaniesApi = (service, validator) => {
  const companiesHandler = new CompaniesHandler(service, validator);
  return routes(companiesHandler);
};

export default createCompaniesApi;