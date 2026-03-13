import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

export interface AuthRequest extends Request {
  adminId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as { id: number };
    req.adminId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
}

export function signToken(adminId: number): string {
  return jwt.sign({ id: adminId }, JWT_SECRET, { expiresIn: '7d' });
}
