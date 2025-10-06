import sqlite3 from 'sqlite3'
import path from 'path'

const db = new sqlite3.Database(path.join(__dirname, '../data.db'))

export const initDatabase = () => {
  db.serialize(() => {
    // シフトテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT DEFAULT '提出済み',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 勤怠テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        date TEXT NOT NULL,
        clock_in TEXT NOT NULL,
        clock_out TEXT,
        total_hours REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 給与テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS salary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        month TEXT NOT NULL,
        hourly_wage REAL NOT NULL,
        total_hours REAL NOT NULL,
        total_salary REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  })
}

export default db
