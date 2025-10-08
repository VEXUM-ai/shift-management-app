import sqlite3 from 'sqlite3'
import { User } from '../types'
import { hashPassword } from '../utils/password'

const DATABASE_PATH = process.env.DATABASE_PATH || './database.sqlite'

class Database {
  private db: sqlite3.Database

  constructor() {
    this.db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err)
      } else {
        console.log('Connected to SQLite database')
        this.initialize()
      }
    })
  }

  /**
   * Initialize database tables
   */
  private initialize(): void {
    this.db.serialize(() => {
      // Users/Members table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          is_admin INTEGER DEFAULT 0,
          office_transport_fee REAL DEFAULT 0,
          salary_type TEXT CHECK(salary_type IN ('hourly', 'fixed')) DEFAULT 'hourly',
          hourly_wage REAL DEFAULT 0,
          fixed_salary REAL DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          last_login TEXT
        )
      `)

      // Locations table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT CHECK(type IN ('office', 'client')) DEFAULT 'client',
          hourly_wage REAL DEFAULT 0,
          transport_fee REAL DEFAULT 0,
          logo TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Shifts table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS shifts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          location_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          transport_fee REAL DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES users(id),
          FOREIGN KEY (location_id) REFERENCES locations(id)
        )
      `)

      // Attendance table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          location_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          clock_in TEXT NOT NULL,
          clock_out TEXT,
          total_hours REAL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES users(id),
          FOREIGN KEY (location_id) REFERENCES locations(id)
        )
      `)

      // Create default admin user if not exists
      this.createDefaultAdmin()
    })
  }

  /**
   * Create default admin user
   */
  private async createDefaultAdmin(): Promise<void> {
    const adminEmail = 'admin@shift-management.com'

    this.db.get(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail],
      async (err, row) => {
        if (err) {
          console.error('Error checking admin:', err)
          return
        }

        if (!row) {
          const hashedPassword = await hashPassword('admin123')

          this.db.run(
            `INSERT INTO users (name, email, password, is_admin, salary_type)
             VALUES (?, ?, ?, ?, ?)`,
            [
              'System Admin',
              adminEmail,
              hashedPassword,
              1,
              'hourly',
            ],
            (err) => {
              if (err) {
                console.error('Error creating admin:', err)
              } else {
                console.log('Default admin created: admin@shift-management.com / admin123')
              }
            }
          )
        }
      }
    )
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err) reject(err)
          else resolve(row || null)
        }
      )
    })
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: User) => {
          if (err) reject(err)
          else resolve(row || null)
        }
      )
    })
  }

  /**
   * Create new user
   */
  createUser(user: Omit<User, 'id' | 'created_at'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO users (name, email, password, is_admin, office_transport_fee,
          salary_type, hourly_wage, fixed_salary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.name,
          user.email,
          user.password,
          user.is_admin ? 1 : 0,
          user.office_transport_fee,
          user.salary_type,
          user.hourly_wage,
          user.fixed_salary,
        ],
        function (err) {
          if (err) reject(err)
          else resolve(this.lastID)
        }
      )
    })
  }

  /**
   * Update user
   */
  updateUser(id: number, user: Partial<User>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields: string[] = []
      const values: any[] = []

      if (user.name !== undefined) {
        fields.push('name = ?')
        values.push(user.name)
      }
      if (user.email !== undefined) {
        fields.push('email = ?')
        values.push(user.email)
      }
      if (user.password !== undefined) {
        fields.push('password = ?')
        values.push(user.password)
      }
      if (user.is_admin !== undefined) {
        fields.push('is_admin = ?')
        values.push(user.is_admin ? 1 : 0)
      }
      if (user.office_transport_fee !== undefined) {
        fields.push('office_transport_fee = ?')
        values.push(user.office_transport_fee)
      }
      if (user.salary_type !== undefined) {
        fields.push('salary_type = ?')
        values.push(user.salary_type)
      }
      if (user.hourly_wage !== undefined) {
        fields.push('hourly_wage = ?')
        values.push(user.hourly_wage)
      }
      if (user.fixed_salary !== undefined) {
        fields.push('fixed_salary = ?')
        values.push(user.fixed_salary)
      }
      if (user.last_login !== undefined) {
        fields.push('last_login = ?')
        values.push(user.last_login)
      }

      values.push(id)

      this.db.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }

  /**
   * Get all users
   */
  getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM users', (err, rows: User[]) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close()
  }
}

export const db = new Database()
