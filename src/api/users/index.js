import UsersHandler from './handler.js';
import routes from './routes.js';

const createUsersApi = (service, validator) => {
  const usersHandler = new UsersHandler(service, validator);
  return routes(usersHandler);
};

export default createUsersApi;