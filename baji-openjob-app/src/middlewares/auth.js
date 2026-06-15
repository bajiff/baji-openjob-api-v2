import jwt from 'jsonwebtoken';
import process from 'process';
import AuthenticationError from '../exceptions/AuthenticationError.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Akses ditolak. Token tidak ditemukan atau format salah.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    
    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    return next(new AuthenticationError('Token tidak valid atau sudah kedaluwarsa.', error));
  }
};

export default authMiddleware;