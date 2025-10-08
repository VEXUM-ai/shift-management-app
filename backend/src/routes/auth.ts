import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { db } from '../database'
import { verifyPassword, hashPassword, validatePasswordStrength } from '../utils/password'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
import { authLimiter } from '../middleware/rateLimiter'
import { authenticate, AuthRequest } from '../middleware/auth'
import { LoginRequest, AuthResponse } from '../types'

const router = express.Router()

/**
 * POST /auth/login
 * User login
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { email, password } = req.body

      // Get user from database
      const user = await db.getUserByEmail(email)

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password)

      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }

      // Update last login
      await db.updateUser(user.id, {
        last_login: new Date().toISOString(),
      })

      // Generate tokens
      const payload = {
        userId: user.id,
        email: user.email,
        is_admin: user.is_admin,
      }

      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      const response: AuthResponse = {
        user: userWithoutPassword,
        token: accessToken,
        refreshToken,
      }

      res.json(response)
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

/**
 * POST /auth/register
 * Register new user (admin only in production)
 */
router.post(
  '/register',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('is_admin').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { name, email, password, is_admin = false } = req.body

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password)
      if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.message })
        return
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email)
      if (existingUser) {
        res.status(409).json({ error: 'Email already registered' })
        return
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user
      const userId = await db.createUser({
        name,
        email,
        password: hashedPassword,
        is_admin,
        office_transport_fee: 0,
        salary_type: 'hourly',
        hourly_wage: 0,
        fixed_salary: 0,
      })

      // Get created user
      const user = await db.getUserById(userId)

      if (!user) {
        res.status(500).json({ error: 'Failed to create user' })
        return
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      res.status(201).json({ user: userWithoutPassword })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

/**
 * POST /auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { currentPassword, newPassword } = req.body

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      // Get user with password
      const user = await db.getUserById(req.user.id)

      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password)

      if (!isValid) {
        res.status(401).json({ error: 'Current password is incorrect' })
        return
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword)
      if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.message })
        return
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword)

      // Update password
      await db.updateUser(user.id, { password: hashedPassword })

      res.json({ message: 'Password changed successfully' })
    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

export default router
