export default class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(req, res, next) {
    try {
      const payload = req.body || {};
      this._validator.validatePostAuthenticationPayload(payload);

      const { email, password } = payload;
      const id = await this._usersService.verifyUserCredential(email, password);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      return res.status(200).json({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putAuthenticationHandler(req, res, next) {
    try {
      const payload = req.body || {};
      this._validator.validatePutAuthenticationPayload(payload);
      const { refreshToken } = payload;

      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });

      return res.json({
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthenticationHandler(req, res, next) {
    try {
      const payload = req.body || {};
      this._validator.validateDeleteAuthenticationPayload(payload);
      const { refreshToken } = payload;

      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return res.json({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}