import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Check } from 'lucide-react'
import { addGroup, updateGroup } from '../../lib/firestore'
import { useAuth } from '../../hooks/useAuth'
import { PIN_CATEGORIES } from './pinIcons'

const GROUP_COLORS = [
  'linear-gradient(135deg,#D9DFFF,#BBE1FA,#FFC4D1)',
  'linear-gradient(135deg,#7B8EF5,#F06892)',
  'linear-gradient(135deg,#62B8F0,#4CAF7D)',
  'linear-gradient(135deg,#FF8C42,#FFD166)',
  'linear-gradient(135deg,#F06892,#FF8C42)',
  'linear-gradient(135deg,#7B8EF5,#62B8F0,#F06892)',
  'linear-gradient(135deg,#4CAF7D,#62B8F0)',
  'linear-gradient(135deg,#EF233C,#7B8EF5)',
]

export default function AddGroupModal({ editGroup, onClose, onSaved }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [iconType, setIconType] = useState('general')
  const [color, setColor] = useState(GROUP_COLORS[1])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editGroup) {
      setTitle(editGroup.title || '')
      setIconType(editGroup.iconType || 'general')
      setColor(editGroup.color || GROUP_COLORS[1])
    }
  }, [editGroup])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Group name is required'); return }
    setSaving(true)
    setError('')
    try {
      const data = { title: title.trim(), iconType, color, userId: user.uid }
      if (editGroup) {
        await updateGroup(editGroup.id, data)
      } else {
        await addGroup({ ...data, pinIds: [] })
      }
      onSaved()
    } catch (err) {
      setError(err?.message || 'Failed to save group.')
    } finally {
      setSaving(false)
    }
  }

  const selectedCategory = PIN_CATEGORIES.find(c => c.id === iconType)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm font-body border border-ntz-blue/30 overflow-hidden"
        >
          {/* Header */}
          <div className="gradient-bg px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-white" />
              <h2 className="font-display font-semibold text-white text-lg">
                {editGroup ? 'Edit Group' : 'Create Group'}
              </h2>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <div
                style={{ background: color, width: 56, height: 56, borderRadius: '50%', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}
              >
                {selectedCategory?.emoji}
              </div>
            </div>

            {/* Group name */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-1.5">
                Group name <span className="text-ntz-pink">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this group..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm text-ntz-dark placeholder:text-ntz-light transition-all"
              />
            </div>

            {/* Emoji picker */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
                {PIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIconType(cat.id)}
                    title={cat.label}
                    className={`relative flex items-center justify-center py-2 rounded-xl border-2 transition-all text-xl ${
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
            </div>

            {/* Gradient color picker */}
            <div>
              <label className="block text-xs font-medium text-ntz-dark mb-2">Group color</label>
              <div className="flex gap-2 flex-wrap">
                {GROUP_COLORS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      background: c,
                      outline: color === c ? '2px solid white' : 'none',
                      boxShadow: color === c ? '0 0 0 3px #7B8EF5' : 'none',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                    className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                    title="Select color"
                  >
                    {color === c && (
                      <Check className="w-3 h-3 text-white" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.6))' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-ntz-dark hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-gradient text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-ntz-pin">
                {saving ? 'Saving...' : (editGroup ? 'Save Changes' : 'Create Group')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
