import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../shared/prisma';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify standard JWT signature and validity
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    
    // 2. Fetch the user and verify they are active and not deleted
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null,
      },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user session or user account has been deactivated.',
      });
    }

    // 3. Optional: Verify session exists in DB
    const session = await prisma.session.findFirst({
      where: {
        userId: user.id,
        token: token,
      },
    });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'Session has expired or is invalid.',
      });
    }

    // 4. Attach user information to request
    req.userId = user.id;
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};
export default authMiddleware;
