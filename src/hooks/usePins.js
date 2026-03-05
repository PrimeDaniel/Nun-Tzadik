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
        setPins(data)
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
