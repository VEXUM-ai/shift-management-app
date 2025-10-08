import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS)
  return bcrypt.hash(password, salt)
}

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean
  message: string
} => {
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters long',
    }
  }

  if (password.length > 100) {
    return {
      valid: false,
      message: 'Password must be less than 100 characters',
    }
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      message: 'Password must contain both letters and numbers',
    }
  }

  return { valid: true, message: '' }
}
