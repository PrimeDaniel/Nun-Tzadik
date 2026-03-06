import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X, MapPin, ChevronRight } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getCategoryById } from './pinIcons'
import GroupCard from './GroupCard'

// Short display names for the district filter buttons
const DISTRICT_LABELS = {
  HaZafon: 'North',
  Haifa: 'Haifa',
  HaMerkaz: 'Central',
  TelAviv: 'Tel Aviv',
  Jerusalem: 'Jerusalem',
  HaDarom: 'South',
  Golan: 'Golan',
}

// Draggable pin card in the ungrouped section
function SortablePinCard({ pin, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pin.id })
  const category = getCategoryById(pin.iconType)
  const dotColor = pin.pinColor || '#7B8EF5'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      <div className="flex items-center gap-1 group">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="w-5 h-8 flex flex-col justify-center gap-0.5 opacity-20 group-hover:opacity-50 flex-shrink-0 cursor-grab active:cursor-grabbing pl-1"
        >
          <div className="w-3 h-0.5 bg-ntz-dark rounded" />
          <div className="w-3 h-0.5 bg-ntz-dark rounded" />
          <div className="w-3 h-0.5 bg-ntz-dark rounded" />
        </div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -2 }}
          onClick={() => onClick(pin)}
          className="flex-1 text-left flex items-start gap-3 p-3 rounded-xl hover:bg-ntz-blue/10 transition-colors border border-transparent hover:border-ntz-blue/20"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 shadow-sm"
            style={{ background: dotColor }}
          >
            {category.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ntz-dark text-sm truncate font-body">{pin.title}</p>
            {pin.description && (
              <p className="text-ntz-light text-xs mt-0.5 line-clamp-2 font-body">{pin.description}</p>
            )}
            <p className="text-ntz-light/70 text-xs mt-1 font-body">{category.label}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-ntz-light group-hover:text-ntz-dark transition-colors flex-shrink-0 mt-2" />
        </motion.button>
      </div>
    </div>
  )
}

// Static (non-sortable) overlay card shown while dragging
function DragOverlayCard({ pin }) {
  const category = getCategoryById(pin.iconType)
  const dotColor = pin.pinColor || '#7B8EF5'
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-2xl border border-ntz-blue/30 w-64 opacity-95">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: dotColor }}>
        {category.emoji}
      </div>
      <p className="font-medium text-ntz-dark text-sm truncate font-body">{pin.title}</p>
    </div>
  )
}

export default function PinSidebar({
  pins,
  allPinsCount,
  districts,
  selectedDistrict,
  onDistrictChange,
  onPinSelect,
  groups = [],
  onGroupUpdate,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activePin, setActivePin] = useState(null)
  // Local order state for ungrouped pins (for optimistic reordering)
  const [ungroupedOrder, setUngroupedOrder] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const districtNames = districts
    ? districts.features.map(f => f.properties.NAME_1).filter(n => DISTRICT_LABELS[n])
    : []

  // When a district is selected, only show groups that have at least one pin in that district
  const visibleGroups = selectedDistrict
    ? groups.filter(g => (g.pinIds || []).some(id => pins.find(p => p.id === id)))
    : groups

  // Compute which pin IDs are in any group
  const groupedPinIds = new Set(groups.flatMap(g => g.pinIds || []))

  // Ungrouped = not in any group
  const ungroupedPins = pins.filter(p => !groupedPinIds.has(p.id))

  // Apply search filter to ungrouped pins
  const searchFiltered = ungroupedPins.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  // Apply local order override if active
  const orderedUngrouped = ungroupedOrder
    ? ungroupedOrder.map(id => searchFiltered.find(p => p.id === id)).filter(Boolean)
    : searchFiltered

  function handleDragStart({ active }) {
    const pin = pins.find(p => p.id === active.id)
    setActivePin(pin || null)
  }

  function handleDragEnd({ active, over }) {
    setActivePin(null)
    if (!over) return

    const draggedId = active.id
    const overId = over.id

    // Determine source container
    const sourceGroup = groups.find(g => (g.pinIds || []).includes(draggedId))
    const sourceContainerId = sourceGroup ? `group-${sourceGroup.id}` : 'ungrouped'

    // Determine target container
    let targetContainerId = overId
    // If dropped directly on a pin, find which container that pin belongs to
    if (!String(overId).startsWith('group-') && overId !== 'ungrouped') {
      const targetGroup = groups.find(g => (g.pinIds || []).includes(overId))
      targetContainerId = targetGroup ? `group-${targetGroup.id}` : 'ungrouped'
    }

    if (sourceContainerId === targetContainerId) {
      // Reorder within same container
      if (targetContainerId === 'ungrouped') {
        const ids = orderedUngrouped.map(p => p.id)
        const oldIdx = ids.indexOf(draggedId)
        const newIdx = ids.indexOf(overId)
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          setUngroupedOrder(arrayMove(ids, oldIdx, newIdx))
        }
      } else {
        const group = groups.find(g => `group-${g.id}` === targetContainerId)
        if (!group) return
        const ids = [...(group.pinIds || [])]
        const oldIdx = ids.indexOf(draggedId)
        const newIdx = ids.indexOf(overId)
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          onGroupUpdate(group.id, { pinIds: arrayMove(ids, oldIdx, newIdx) })
        }
      }
    } else {
      // Move between containers
      // Remove from source
      if (sourceGroup) {
        const newSourceIds = (sourceGroup.pinIds || []).filter(id => id !== draggedId)
        onGroupUpdate(sourceGroup.id, { pinIds: newSourceIds })
      } else {
        // Was ungrouped — just remove from local order tracking
        setUngroupedOrder(prev => prev ? prev.filter(id => id !== draggedId) : null)
      }

      // Add to target
      if (targetContainerId !== 'ungrouped') {
        const targetGroup = groups.find(g => `group-${g.id}` === targetContainerId)
        if (targetGroup) {
          const existingIds = targetGroup.pinIds || []
          // Insert before the over pin if possible
          const overIndex = existingIds.indexOf(overId)
          const newIds = overIndex !== -1
            ? [...existingIds.slice(0, overIndex), draggedId, ...existingIds.slice(overIndex)]
            : [...existingIds, draggedId]
          onGroupUpdate(targetGroup.id, { pinIds: newIds })
        }
      }
      // If target is ungrouped, no Firestore update needed — removal from group is enough
    }
  }

  return (
    <>
      {/* Toggle button */}
      <div className="absolute top-1 right-4 z-[500]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-white text-ntz-dark px-3.5 py-2.5 rounded-xl shadow-ntz-card border border-ntz-blue/30 text-sm font-medium font-body hover:border-ntz-blue transition-colors"
        >
          {open ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
          <span>{open ? 'Close' : `Pins (${allPinsCount ?? pins.length})`}</span>
        </motion.button>
      </div>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-80 z-[499] bg-white/95 backdrop-blur-md border-l border-ntz-blue/20 shadow-2xl flex flex-col font-body"
          >
            {/* Header */}
            <div className="gradient-bg px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <h2 className="font-display font-semibold text-white text-base">My Pins</h2>
                </div>
                <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {pins.length}
                </span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pins..."
                className="w-full bg-white/20 text-white placeholder:text-white/70 text-sm px-3 py-2 rounded-xl border border-white/20 outline-none focus:bg-white/30 transition-colors"
              />
            </div>

            {/* District filter */}
            {districtNames.length > 0 && (
              <div className="px-3 py-2 border-b border-ntz-blue/10 flex gap-1.5 flex-wrap">
                <button
                  onClick={() => onDistrictChange(null)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${!selectedDistrict ? 'btn-gradient text-white shadow-sm' : 'bg-gray-100 text-ntz-dark hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                {districtNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => onDistrictChange(selectedDistrict === name ? null : name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${selectedDistrict === name ? 'btn-gradient text-white shadow-sm' : 'bg-gray-100 text-ntz-dark hover:bg-gray-200'
                      }`}
                  >
                    {DISTRICT_LABELS[name]}
                  </button>
                ))}
              </div>
            )}

            {/* DnD list area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {/* Ungrouped pins */}
                {orderedUngrouped.length === 0 && visibleGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📍</div>
                    <p className="text-ntz-light text-sm">
                      {pins.length === 0 ? 'No pins yet. Click the map to add one!' : 'No matching pins.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <SortableContext items={orderedUngrouped.map(p => p.id)} strategy={verticalListSortingStrategy}>
                      {orderedUngrouped.map(pin => (
                        <SortablePinCard key={pin.id} pin={pin} onClick={onPinSelect} />
                      ))}
                    </SortableContext>

                    {/* Groups */}
                    {visibleGroups.length > 0 && (
                      <div className={`${orderedUngrouped.length > 0 ? 'mt-4 pt-3 border-t border-ntz-blue/10' : ''} space-y-1`}>
                        {orderedUngrouped.length > 0 && (
                          <p className="text-xs text-ntz-light font-medium px-1 mb-2">Groups</p>
                        )}
                        {visibleGroups.map(group => (
                          <GroupCard
                            key={group.id}
                            group={group}
                            pins={pins}
                            onPinSelect={onPinSelect}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                <DragOverlay>
                  {activePin ? <DragOverlayCard pin={activePin} /> : null}
                </DragOverlay>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
