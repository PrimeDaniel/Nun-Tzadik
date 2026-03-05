import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { createUserProfile, getUserProfile } from '../lib/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const prof = await getUserProfile(firebaseUser.uid)
          setProfile(prof)
        } catch (e) {
          console.error('Failed to load user profile:', e)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await createUserProfile(cred.user.uid, { displayName, email })
    const prof = await getUserProfile(cred.user.uid)
    setProfile(prof)
    return cred.user
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider)
    const existing = await getUserProfile(cred.user.uid)
    if (!existing) {
      await createUserProfile(cred.user.uid, {
        displayName: cred.user.displayName,
        email: cred.user.email,
      })
    }
    const prof = await getUserProfile(cred.user.uid)
    setProfile(prof)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
