import { useEffect, useState } from 'react'
import { subscribeToGroups } from '../lib/firestore'

export function useGroups(userId) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setGroups([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToGroups(
      userId,
      (data) => {
        // Sort by createdAt ascending (oldest first = stable group order)
        const sorted = [...data].sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0
          const tb = b.createdAt?.toMillis?.() ?? 0
          return ta - tb
        })
        setGroups(sorted)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [userId])

  return { groups, loading }
}
