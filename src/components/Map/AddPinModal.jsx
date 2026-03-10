import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Link, Image, AlignLeft, Check, Search, Camera } from 'lucide-react'
import { addPin, updatePin } from '../../lib/firestore'
import { useAuth } from '../../hooks/useAuth'
import { useUpload } from '../../lib/UploadContext'
import { PIN_CATEGORIES } from './pinIcons'

const MAX_IMAGES = 15

const PIN_COLORS = [
  '#7B8EF5', '#62B8F0', '#F06892', '#4CAF7D',
  '#FF8C42', '#FFD166', '#EF233C', '#333333',
]

export default function AddPinModal({ latlng, editPin, onClose, onSaved }) {
  const { user } = useAuth()
  const { startUploads } = useUpload()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [iconType, setIconType] = useState('general')
  const [pinColor, setPinColor] = useState('#7B8EF5')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Image state
  const [imageFiles, setImageFiles] = useState([])       // new File objects
  const [imagePreviews, setImagePreviews] = useState([]) // object URLs for new files
  const [existingUrls, setExistingUrls] = useState([])   // already-saved URLs (edit mode)

  // Place search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [activeLatlng, setActiveLatlng] = useState(latlng)
  const searchTimer = useRef(null)

  // Pre-fill when editing
  useEffect(() => {
    if (editPin) {
      setTitle(editPin.title || '')
      setDescription(editPin.description || '')
      setLinkUrl(editPin.linkUrl || '')
      setIconType(editPin.iconType || 'general')
      setPinColor(editPin.pinColor || '#7B8EF5')
      setActiveLatlng({ lat: editPin.lat, lng: editPin.lng })
      // Support both old single imageUrl and new imageUrls array
      if (editPin.imageUrls?.length) {
        setExistingUrls(editPin.imageUrls)
      } else if (editPin.imageUrl) {
        setExistingUrls([editPin.imageUrl])
      }
    }
  }, [editPin])

  useEffect(() => {
    setActiveLatlng(latlng)
  }, [latlng])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { imagePreviews.forEach(URL.revokeObjectURL) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchInput(e) {
    const q = e.target.value
    setSearchQuery(q)
    setSearchResults([])
    clearTimeout(searchTimer.current)
    if (q.trim().length < 3) return
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=il`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'NunTzadikApp/1.0' } }
        )
        const data = await res.json()
        setSearchResults(data)
      } catch {
        // silently ignore search errors
      }
    }, 400)
  }

  function handlePlaceSelect(result) {
    const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
    setActiveLatlng(coords)
    setSelectedPlace(result.display_name)
    setSearchQuery('')
    setSearchResults([])
    if (!title) setTitle(result.display_name.split(',')[0])
  }

  function handleFilesSelected(e) {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const totalAllowed = MAX_IMAGES - existingUrls.length - imageFiles.length
    const toAdd = selected.slice(0, totalAllowed)
    const newPreviews = toAdd.map(f => URL.createObjectURL(f))
    setImageFiles(prev => [...prev, ...toAdd])
    setImagePreviews(prev => [...prev, ...newPreviews])
    // Reset input so same files can be re-selected
    e.target.value = ''
  }

  function removeNewImage(idx) {
    URL.revokeObjectURL(imagePreviews[idx])
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  function removeExistingImage(idx) {
    setExistingUrls(prev => prev.filter((_, i) => i !== idx))
  }

  const totalImages = existingUrls.length + imageFiles.length
  const canAddMore = totalImages < MAX_IMAGES

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!activeLatlng) { setError('Please click a location on the map or search for a place'); return }
    setSaving(true)
    setError('')
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        // Save with existing URLs only; new uploads will patch in via background context
        imageUrls: existingUrls,
        imageUrl: existingUrls[0] || '',
        linkUrl: linkUrl.trim(),
        iconType,
        pinColor,
        userId: user.uid,
      }

      if (editPin) {
        await updatePin(editPin.id, data)
        if (imageFiles.length > 0) {
          startUploads(editPin.id, imageFiles, user.uid, existingUrls)
        }
      } else {
        const docRef = await addPin({ ...data, lat: activeLatlng.lat, lng: activeLatlng.lng })
        if (imageFiles.length > 0) {
          startUploads(docRef.id, imageFiles, user.uid, existingUrls)
        }
      }
      onSaved()
    } catch (err) {
      console.error('addPin error:', err)
      setError(err?.message || 'Failed to save pin. Check the console for details.')
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md font-body border border-ntz-blue/30 overflow-hidden"
        >
          {/* Header */}
          <div className="gradient-bg px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white" />
              <h2 className="font-display font-semibold text-white text-lg">
                {editPin ? 'Edit Pin' : 'Add Pin'}
              </h2>
            </div>
            {latlng && !editPin && (
              <span className="text-white/80 text-xs">
                {latlng.lat.toFixed(4)}, {latlng.lng.toFixed(4)}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Place search */}
            {!editPin && (
              <div className="relative">
                <label className="block text-xs font-medium text-ntz-dark mb-1.5">
                  <Search className="inline w-3 h-3 mr-1" />
                  Search for a place
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Type a place name in Israel..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm text-ntz-dark placeholder:text-ntz-light transition-all"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePlaceSelect(r)}
                        className="w-full text-left px-4 py-2.5 text-xs text-ntz-dark hover:bg-ntz-blue/10 transition-colors border-b border-gray-50 last:border-0"
                      >
                        {r.display_name.length > 70 ? r.display_name.slice(0, 70) + '…' : r.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {selectedPlace && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Pinning: {selectedPlace.split(',')[0]}
                  </p>
                )}
                {activeLatlng && !selectedPlace && (
                  <p className="text-xs text-ntz-light mt-1">
                    Map click: {activeLatlng.lat.toFixed(4)}, {activeLatlng.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            {/* Icon picker */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-2">Category</label>
              <div className="grid grid-cols-8 gap-1.5">
                {PIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIconType(cat.id)}
                    title={cat.label}
                    className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 transition-all text-xl ${
                      iconType === cat.id
                        ? 'border-ntz-pink bg-ntz-pink/10 shadow-sm'
                        : 'border-gray-100 hover:border-ntz-blue/50 bg-gray-50'
                    }`}
                  >
                    {cat.emoji}
                    {iconType === cat.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-ntz-pink rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ntz-light mt-1">
                {PIN_CATEGORIES.find(c => c.id === iconType)?.label}
              </p>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-2">Pin color</label>
              <div className="flex gap-2 flex-wrap">
                {PIN_COLORS.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPinColor(color)}
                    style={{
                      background: color,
                      outline: pinColor === color ? '2px solid white' : 'none',
                      boxShadow: pinColor === color ? '0 0 0 3px #7B8EF5' : 'none',
                      transform: pinColor === color ? 'scale(1.15)' : 'scale(1)',
                    }}
                    className="w-7 h-7 rounded-full transition-all flex items-center justify-center"
                    title="Select color"
                  >
                    {pinColor === color && (
                      <Check className="w-3 h-3 text-white" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.6))' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-1.5">
                Title <span className="text-ntz-pink">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this place..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm text-ntz-dark placeholder:text-ntz-light transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-1.5">
                <AlignLeft className="inline w-3 h-3 mr-1" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell a story about this place..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm text-ntz-dark placeholder:text-ntz-light transition-all resize-none"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-2">
                <Image className="inline w-3 h-3 mr-1" />
                Photos
                <span className="text-ntz-light font-normal ml-1">({totalImages}/{MAX_IMAGES})</span>
              </label>

              {/* Thumbnail grid */}
              {totalImages > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {/* Existing saved images */}
                  {existingUrls.map((url, i) => (
                    <div key={`ex-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {/* New file previews */}
                  {imagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button / drop area */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-ntz-blue rounded-xl py-4 flex flex-col items-center gap-1.5 transition-colors text-ntz-light hover:text-ntz-dark"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-xs font-medium">
                    {totalImages === 0 ? 'Click to add photos' : 'Add more photos'}
                  </span>
                  <span className="text-xs opacity-60">Up to {MAX_IMAGES - totalImages} more</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-1.5">
                <Link className="inline w-3 h-3 mr-1" />
                External Link
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm text-ntz-dark placeholder:text-ntz-light transition-all"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-ntz-dark hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-gradient text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-ntz-pin"
              >
                {saving ? 'Saving…' : (editPin ? 'Save Changes' : 'Add Pin')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
