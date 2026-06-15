import BookmarksHandler from './handler.js';
import routes from './routes.js';

const createBookmarksApi = (service, validator) => {
  const bookmarksHandler = new BookmarksHandler(service, validator);
  return routes(bookmarksHandler);
};

export default createBookmarksApi;