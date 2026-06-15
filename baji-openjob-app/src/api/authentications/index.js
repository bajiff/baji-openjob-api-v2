import AuthenticationsHandler from './handler.js';
import routes from './routes.js';

const createAuthenticationsApi = (authenticationsService, usersService, tokenManager, validator) => {
  const authenticationsHandler = new AuthenticationsHandler(
    authenticationsService,
    usersService,
    tokenManager,
    validator
  );
  return routes(authenticationsHandler);
};

export default createAuthenticationsApi;