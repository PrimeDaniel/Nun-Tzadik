import { useEffect, useState } from 'react'
import { subscribeToPins } from '../lib/firestore'

export function usePins(userId) {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setPins([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeToPins(
      userId,
      (data) => {
        // Sort newest-first client-side (no composite index needed)
        const sorted = [...data].sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0
          const tb = b.createdAt?.toMillis?.() ?? 0
          return tb - ta
        })
        setPins(sorted)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false) // always stop loading, even on error
      }
    )
    return unsubscribe
  }, [userId])

  return { pins, loading, error }
}
