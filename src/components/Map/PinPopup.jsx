import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Trash2, Edit3, X, Map, Navigation, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import { deletePin, addPin } from '../../lib/firestore'
import { getCategoryById } from './pinIcons'

export default function PinPopup({ pin, isOwner, viewerUser, onEdit, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const category = getCategoryById(pin.iconType)
  const accentColor = pin.pinColor || '#7B8EF5'

  // Support both new imageUrls[] and legacy single imageUrl
  const images = pin.imageUrls?.length ? pin.imageUrls : pin.imageUrl ? [pin.imageUrl] : []

  async function handleDelete() {
    if (!confirm('Delete this pin?')) return
    setDeleting(true)
    await deletePin(pin.id)
    onClose()
  }

  async function handleCopy() {
    if (!viewerUser) return
    setCopying(true)
    try {
      const { id: _id, createdAt: _ts, userId: _uid, ...rest } = pin
      await addPin({ ...rest, userId: viewerUser.uid })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } finally {
      setCopying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl overflow-hidden shadow-2xl font-body"
      style={{ minWidth: 280, maxWidth: 320 }}
    >
      {/* Color accent header strip */}
      <div style={{ background: accentColor, height: 4 }} />

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="w-full h-44 relative overflow-hidden" style={{ background: `${accentColor}22` }}>
          <img
            key={imgIdx}
            src={images[imgIdx]}
            alt={pin.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setImgIdx(i => (i + 1) % images.length)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Category badge + close */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ background: accentColor }}
            >
              {category.emoji}
            </span>
            <span className="text-xs text-ntz-light font-medium">{category.label}</span>
          </div>
          <button onClick={onClose} className="text-ntz-light hover:text-ntz-dark transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-display font-semibold text-ntz-dark text-base leading-snug mb-1">
          {pin.title}
        </h3>

        {pin.description && (
          <p className="text-sm text-ntz-light leading-relaxed mb-3 line-clamp-3">
            {pin.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-4">

          {pin.linkUrl && (
            <a
              href={pin.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ntz-dark bg-ntz-blue/30 hover:bg-ntz-blue/50 px-3 py-1.5 rounded-full transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Visit link
            </a>
          )}

          {isOwner && (
            <>
              <button
                onClick={() => onEdit(pin)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ntz-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {deleting ? '...' : 'Delete'}
              </button>
            </>
          )}

          {!isOwner && viewerUser && (
            <button
              onClick={handleCopy}
              disabled={copying}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : copying ? '...' : 'Copy to my map'}
            </button>
          )}
        </div>

        {/* Primary Navigation Buttons */}
        <div className="flex flex-row gap-2 mt-2 w-full">
          <a
            href={`https://waze.com/ul?ll=${pin.lat},${pin.lng}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#4A90E2] hover:bg-[#3A80D2] py-2.5 rounded-full transition-colors shadow-sm cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-white fill-white" />
            Waze
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#37BA6B] hover:bg-[#2CA05A] py-2.5 rounded-full transition-colors shadow-sm cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-white fill-white" />
            Google Maps
          </a>
        </div>
      </div>
    </motion.div>
  )
}
