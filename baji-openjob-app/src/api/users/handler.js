export default class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(req, res, next) {
    try {
      const payload = req.body || {};

      this._validator.validateUserPayload(payload);

      const { name, email, password } = payload;
      
      const userId = await this._service.addUser({ name, email, password });

      return res.status(201).json({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          id: userId,
        },
      });
    } catch (error) {
      next(error); 
    }
  }
  
  async getUserByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this._service.getUserById(id);

      return res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          name: user.name || user.fullname,
          fullname: user.fullname || user.name, 
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}