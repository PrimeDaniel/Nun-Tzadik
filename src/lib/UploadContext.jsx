import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { updatePin } from './firestore'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

const UploadContext = createContext(null)

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', UPLOAD_URL)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100)
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url)
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed — check your internet connection'))
    xhr.send(formData)
  })
}

export function UploadProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const pinUrlsRef = useRef({}) // { [pinId]: (string|null)[] }

  const startUploads = useCallback((pinId, files, _userId, existingUrls = []) => {
    // Initialise URL slots: existing URLs first, then nulls for new files
    pinUrlsRef.current[pinId] = [...existingUrls, ...new Array(files.length).fill(null)]

    const newTasks = files.map((f, i) => ({
      id: `${pinId}-${i}-${Date.now()}`,
      pinId,
      slotIndex: existingUrls.length + i,
      fileName: f.name,
      progress: 0,
      done: false,
      error: null,
    }))

    setTasks(prev => [...prev, ...newTasks])

    let completedCount = 0

    newTasks.forEach((task, i) => {
      uploadToCloudinary(files[i], (progress) => {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress } : t))
      })
        .then((url) => {
          pinUrlsRef.current[pinId][task.slotIndex] = url
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 100, done: true } : t))
          completedCount++
          maybeFinalize(pinId, newTasks.length, completedCount)
        })
        .catch((err) => {
          console.error('Upload error:', err)
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, error: err.message, done: true } : t))
          completedCount++
          maybeFinalize(pinId, newTasks.length, completedCount)
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function maybeFinalize(pinId, total, completed) {
    if (completed < total) return
    const urls = (pinUrlsRef.current[pinId] || []).filter(Boolean)
    updatePin(pinId, { imageUrls: urls, imageUrl: urls[0] || '' }).catch(err =>
      console.error('Failed to update pin with image URLs:', err)
    )
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.pinId !== pinId))
      delete pinUrlsRef.current[pinId]
    }, 3000)
  }

  return (
    <UploadContext.Provider value={{ tasks, startUploads }}>
      {children}
    </UploadContext.Provider>
  )
}

export function useUpload() {
  return useContext(UploadContext)
}
