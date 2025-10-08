import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../utils/api'

// データ取得カスタムフック
export function useDataFetch<T>(endpoint: string, initialData: T) {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiGet<T>(endpoint)
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました'
      setError(errorMessage)
      console.error(`Error fetching ${endpoint}:`, err)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, setData, loading, error, refetch: fetchData }
}

// 複数エンドポイントの同時取得
export function useMultiDataFetch<T1, T2, T3>(
  endpoint1: string,
  endpoint2: string,
  endpoint3?: string
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data1, setData1] = useState<T1 | null>(null)
  const [data2, setData2] = useState<T2 | null>(null)
  const [data3, setData3] = useState<T3 | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const promises = [
        apiGet<T1>(endpoint1),
        apiGet<T2>(endpoint2),
      ]

      if (endpoint3) {
        promises.push(apiGet<T3>(endpoint3))
      }

      const results = await Promise.all(promises)
      setData1(results[0] as T1)
      setData2(results[1] as T2)
      if (endpoint3 && results[2]) {
        setData3(results[2] as T3)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました'
      setError(errorMessage)
      console.error('Error fetching multiple endpoints:', err)
    } finally {
      setLoading(false)
    }
  }, [endpoint1, endpoint2, endpoint3])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    data1,
    data2,
    data3,
    setData1,
    setData2,
    setData3,
    loading,
    error,
    refetch: fetchAll,
  }
}
