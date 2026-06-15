import jwt from 'jsonwebtoken';
import InvariantError from '../exceptions/InvariantError.js';
import process from 'process';

const TokenManager = {
  generateAccessToken: (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' }),
  
  generateRefreshToken: (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_KEY),
  
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return artifacts;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid', error);
    }
  },
};

export default TokenManager;