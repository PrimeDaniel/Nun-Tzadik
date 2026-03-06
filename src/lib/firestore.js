import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
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
  // No orderBy — avoids composite index requirement.
  // Sorting is done client-side in usePins.js.
  const q = query(
    collection(db, 'pins'),
    where('userId', '==', userId)
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

// ---- Groups ----

export function subscribeToGroups(userId, callback, onError) {
  const q = query(collection(db, 'groups'), where('userId', '==', userId))
  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(groups)
    },
    (error) => {
      console.error('Firestore groups error:', error)
      if (onError) onError(error)
    }
  )
}

export async function addGroup(data) {
  return addDoc(collection(db, 'groups'), { ...data, createdAt: serverTimestamp() })
}

export async function updateGroup(groupId, data) {
  await updateDoc(doc(db, 'groups', groupId), data)
}

export async function deleteGroup(groupId) {
  await deleteDoc(doc(db, 'groups', groupId))
}
