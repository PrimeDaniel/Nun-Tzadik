import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getCategoryById } from './pinIcons'

// A draggable mini pin card rendered inside a group
function SortablePinCard({ pin, onPinSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pin.id })
  const category = getCategoryById(pin.iconType)
  const dotColor = pin.pinColor || '#7B8EF5'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ntz-blue/10 transition-colors group cursor-grab active:cursor-grabbing"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="w-4 h-4 flex flex-col justify-center gap-0.5 opacity-30 group-hover:opacity-60 flex-shrink-0"
      >
        <div className="w-3 h-0.5 bg-ntz-dark rounded" />
        <div className="w-3 h-0.5 bg-ntz-dark rounded" />
        <div className="w-3 h-0.5 bg-ntz-dark rounded" />
      </div>

      {/* Icon */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
        style={{ background: dotColor }}
      >
        {category.emoji}
      </div>

      {/* Title */}
      <button
        onClick={() => onPinSelect(pin)}
        className="flex-1 text-left min-w-0"
      >
        <p className="font-medium text-ntz-dark text-xs truncate font-body">{pin.title}</p>
      </button>
    </div>
  )
}

export default function GroupCard({ group, pins, onPinSelect }) {
  const [expanded, setExpanded] = useState(false)
  const category = getCategoryById(group.iconType || 'general')

  const { setNodeRef, isOver } = useDroppable({ id: `group-${group.id}` })

  const groupPins = group.pinIds
    ? group.pinIds.map(id => pins.find(p => p.id === id)).filter(Boolean)
    : []

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 transition-all ${isOver
          ? 'border-ntz-blue bg-ntz-blue/5'
          : 'border-transparent hover:border-ntz-blue/20'
        }`}
    >
      {/* Group header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-2.5 text-left"
      >
        {/* Circular gradient icon */}
        <div
          style={{
            background: group.color || '#7B8EF5',
            width: 36,
            height: 36,
            borderRadius: '12px',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {category.emoji}
        </div>

        {/* Name + count */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ntz-dark text-sm truncate font-body">{group.title}</p>
        </div>
        <span className="bg-gray-100 text-ntz-light text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
          {groupPins.length}
        </span>

        {/* Chevron */}
        {expanded
          ? <ChevronDown className="w-4 h-4 text-ntz-light flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-ntz-light flex-shrink-0" />
        }
      </button>

      {/* Expanded pin list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-2">
              <SortableContext
                items={groupPins.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {groupPins.length === 0 ? (
                  <p className="text-center text-xs text-ntz-light py-3">
                    Drag pins here
                  </p>
                ) : (
                  groupPins.map(pin => (
                    <SortablePinCard key={pin.id} pin={pin} onPinSelect={onPinSelect} />
                  ))
                )}
              </SortableContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
