import { Request, Response, NextFunction } from 'express'

// 共通バリデーションエラーハンドラ
export class ValidationError extends Error {
  statusCode: number

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
  }
}

// メール形式バリデーション
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 必須フィールドチェック
export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = []

    for (const field of fields) {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `必須フィールドが不足しています: ${missingFields.join(', ')}`
      })
    }

    next()
  }
}

// 数値バリデーション
export const validateNumber = (value: any, fieldName: string, min?: number, max?: number): number => {
  const num = Number(value)

  if (isNaN(num)) {
    throw new ValidationError(`${fieldName}は数値である必要があります`)
  }

  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName}は${min}以上である必要があります`)
  }

  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName}は${max}以下である必要があります`)
  }

  return num
}

// 日付バリデーション
export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// 時刻バリデーション (HH:mm形式)
export const validateTime = (timeString: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeString)
}

// メンバーバリデーションミドルウェア
export const validateMember = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, office_transport_fee } = req.body

  try {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('名前は必須です')
    }

    if (name.trim().length > 100) {
      throw new ValidationError('名前は100文字以内で入力してください')
    }

    if (email && !isValidEmail(email)) {
      throw new ValidationError('有効なメールアドレスを入力してください')
    }

    if (office_transport_fee !== undefined) {
      validateNumber(office_transport_fee, '交通費', 0, 100000)
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
}

// 常駐先バリデーションミドルウェア
export const validateLocation = (req: Request, res: Response, next: NextFunction) => {
  const { name, hourly_wage, type, transportation_fee } = req.body

  try {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('常駐先名は必須です')
    }

    if (name.trim().length > 100) {
      throw new ValidationError('常駐先名は100文字以内で入力してください')
    }

    if (hourly_wage !== undefined) {
      validateNumber(hourly_wage, '時給', 0, 100000)
    }

    if (type && !['office', 'client'].includes(type)) {
      throw new ValidationError('タイプは office または client である必要があります')
    }

    if (transportation_fee !== undefined) {
      validateNumber(transportation_fee, '交通費', 0, 100000)
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
}

// シフトバリデーションミドルウェア
export const validateShift = (req: Request, res: Response, next: NextFunction) => {
  const { employee_name, location, date, start_time, end_time, transportation_fee } = req.body

  try {
    if (!employee_name || employee_name.trim().length === 0) {
      throw new ValidationError('メンバー名は必須です')
    }

    if (!location || location.trim().length === 0) {
      throw new ValidationError('勤務地は必須です')
    }

    if (!date || !validateDate(date)) {
      throw new ValidationError('有効な日付を入力してください (YYYY-MM-DD)')
    }

    if (!start_time || !validateTime(start_time)) {
      throw new ValidationError('有効な開始時刻を入力してください (HH:mm)')
    }

    if (!end_time || !validateTime(end_time)) {
      throw new ValidationError('有効な終了時刻を入力してください (HH:mm)')
    }

    // 開始時刻が終了時刻より前かチェック
    const start = new Date(`2000-01-01 ${start_time}`)
    const end = new Date(`2000-01-01 ${end_time}`)

    if (start >= end) {
      throw new ValidationError('終了時刻は開始時刻より後である必要があります')
    }

    if (transportation_fee !== undefined) {
      validateNumber(transportation_fee, '交通費', 0, 100000)
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
}

// 勤怠バリデーションミドルウェア
export const validateAttendance = (req: Request, res: Response, next: NextFunction) => {
  const { employee_name, location, date, clock_in, clock_out } = req.body

  try {
    if (!employee_name || employee_name.trim().length === 0) {
      throw new ValidationError('メンバー名は必須です')
    }

    if (!location || location.trim().length === 0) {
      throw new ValidationError('勤務地は必須です')
    }

    if (!date || !validateDate(date)) {
      throw new ValidationError('有効な日付を入力してください')
    }

    if (!clock_in || !validateTime(clock_in)) {
      throw new ValidationError('有効な出勤時刻を入力してください (HH:mm)')
    }

    if (clock_out && !validateTime(clock_out)) {
      throw new ValidationError('有効な退勤時刻を入力してください (HH:mm)')
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
}
