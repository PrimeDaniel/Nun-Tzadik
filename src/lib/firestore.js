import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// ---- User profile ----

export async function createUserProfile(userId, data) {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ---- Pins ----

export function subscribeToPins(userId, callback, onError) {
  const q = query(
    collection(db, 'pins'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const pins = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(pins)
    },
    (error) => {
      console.error('Firestore pins error:', error)
      if (onError) onError(error)
    }
  )
}

export async function addPin(pinData) {
  return addDoc(collection(db, 'pins'), {
    ...pinData,
    createdAt: serverTimestamp(),
  })
}

export async function updatePin(pinId, data) {
  await updateDoc(doc(db, 'pins', pinId), data)
}

export async function deletePin(pinId) {
  await deleteDoc(doc(db, 'pins', pinId))
}
