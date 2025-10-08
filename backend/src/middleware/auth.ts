import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import { verifyToken } from '../utils/jwt'
import { db } from '../database'

/**
 * Authentication middleware - Verify JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token)

    // Get user from database
    const user = await db.getUserById(payload.userId)

    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user

    // Attach user to request
    req.user = userWithoutPassword

    next()
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message })
    } else {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }
}

/**
 * Admin-only middleware
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  if (!req.user.is_admin) {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  next()
}

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      const user = await db.getUserById(payload.userId)

      if (user) {
        const { password, ...userWithoutPassword } = user
        req.user = userWithoutPassword
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}
