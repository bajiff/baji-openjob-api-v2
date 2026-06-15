export default class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(req, res, next) {
    try {
      this._validator.validateUserPayload(req.body);

      const { name, email, password } = req.body;
      const user_id = await this._service.addUser({ name, email, password });

      return res.status(201).json({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          user_id,
        },
      });
    } catch (error) {
      next(error); 
    }
  }
}