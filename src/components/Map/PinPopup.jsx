import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Trash2, Edit3, X, Image } from 'lucide-react'
import { deletePin } from '../../lib/firestore'
import { getCategoryById } from './pinIcons'

function isDirectImage(url) {
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url)
}

export default function PinPopup({ pin, isOwner, onEdit, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const category = getCategoryById(pin.iconType)
  const accentColor = pin.pinColor || '#7B8EF5'

  async function handleDelete() {
    if (!confirm('Delete this pin?')) return
    setDeleting(true)
    await deletePin(pin.id)
    onClose()
  }

  const showAsImage = pin.imageUrl && isDirectImage(pin.imageUrl) && !imgError

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

      {/* Image or placeholder */}
      {pin.imageUrl && (
        <div className="w-full h-36 relative overflow-hidden" style={{ background: `${accentColor}22` }}>
          {showAsImage ? (
            <img
              src={pin.imageUrl}
              alt={pin.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <a
              href={pin.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center h-full text-ntz-light hover:text-ntz-dark transition-colors group"
            >
              <Image className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">View image / post</span>
            </a>
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

        <div className="flex items-center gap-2 flex-wrap">
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
        </div>
      </div>
    </motion.div>
  )
}
