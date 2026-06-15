import ProfileHandler from './handler.js';
import routes from './routes.js';

const createProfileApi = (usersService, applicationsService, bookmarksService) => {
  const profileHandler = new ProfileHandler(usersService, applicationsService, bookmarksService);
  return routes(profileHandler);
};

export default createProfileApi;