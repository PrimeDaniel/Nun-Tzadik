import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Link, Image, AlignLeft, Check } from 'lucide-react'
import { addPin, updatePin } from '../../lib/firestore'
import { useAuth } from '../../hooks/useAuth'
import { PIN_CATEGORIES } from './pinIcons'

export default function AddPinModal({ latlng, editPin, onClose, onSaved }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [iconType, setIconType] = useState('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill when editing
  useEffect(() => {
    if (editPin) {
      setTitle(editPin.title || '')
      setDescription(editPin.description || '')
      setImageUrl(editPin.imageUrl || '')
      setLinkUrl(editPin.linkUrl || '')
      setIconType(editPin.iconType || 'general')
    }
  }, [editPin])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim(),
        iconType,
        userId: user.uid,
      }

      if (editPin) {
        await updatePin(editPin.id, data)
      } else {
        await addPin({ ...data, lat: latlng.lat, lng: latlng.lng })
      }
      onSaved()
    } catch (err) {
      setError('Failed to save pin. Please try again.')
    } finally {
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
            {/* Icon picker */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-2">Category</label>
              <div className="grid grid-cols-6 gap-1.5">
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

            {/* Image URL */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-1.5">
                <Image className="inline w-3 h-3 mr-1" />
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or Instagram/Facebook link"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm text-ntz-dark placeholder:text-ntz-light transition-all"
              />
              <p className="text-xs text-ntz-light mt-1">Paste a direct image URL or a social media post link</p>
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
                {saving ? 'Saving...' : (editPin ? 'Save Changes' : 'Add Pin')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
