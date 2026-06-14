export default class ProfileHandler {
  constructor(usersService, applicationsService, bookmarksService) {
    this._usersService = usersService;
    this._applicationsService = applicationsService;
    this._bookmarksService = bookmarksService;
    this.getProfileHandler = this.getProfileHandler.bind(this);
    this.getApplicationsHandler = this.getApplicationsHandler.bind(this);
    this.getBookmarksHandler = this.getBookmarksHandler.bind(this);
  }

  async getProfileHandler(req, res, next) {
    try {
      const userId = req.user.id; 
      
      const user = await this._usersService.getUserById(userId);

      return res.json({
        status: 'success',
        data: {
          ...user,
          role: 'user',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsHandler(req, res, next) {
    try {
      const userId = req.user.id;
      
      const applications = await this._applicationsService.getApplicationsByUserId(userId);

      return res.json({
        status: 'success',
        data: {
          applications,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarksHandler(req, res, next) {
    try {
      const userId = req.user.id;
      
      const bookmarks = await this._bookmarksService.getBookmarks(userId);

      return res.json({
        status: 'success',
        data: {
          bookmarks,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}