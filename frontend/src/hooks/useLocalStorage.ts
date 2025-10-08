import { useState, useEffect } from 'react'

// LocalStorage カスタムフック
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  return [storedValue, setValue] as const
}

// 配列のLocalStorage管理
export function useLocalStorageArray<T>(key: string) {
  const [array, setArray] = useLocalStorage<T[]>(key, [])

  const addItem = (item: T) => {
    setArray((prev) => [...prev, item])
  }

  const removeItem = (predicate: (item: T) => boolean) => {
    setArray((prev) => prev.filter((item) => !predicate(item)))
  }

  const updateItem = (predicate: (item: T) => boolean, newItem: T) => {
    setArray((prev) =>
      prev.map((item) => (predicate(item) ? newItem : item))
    )
  }

  return { array, setArray, addItem, removeItem, updateItem }
}
