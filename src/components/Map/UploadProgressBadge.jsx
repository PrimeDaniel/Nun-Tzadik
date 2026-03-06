import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useUpload } from '../../lib/UploadContext'

const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function UploadProgressBadge() {
  const { tasks } = useUpload()
  const [expanded, setExpanded] = useState(false)

  if (tasks.length === 0) return null

  const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0)
  const overallPercent = Math.round(totalProgress / tasks.length)
  const allDone = tasks.every(t => t.done)
  const hasError = tasks.some(t => t.error)

  const strokeDashoffset = CIRCUMFERENCE * (1 - overallPercent / 100)

  return (
    <div className="absolute bottom-8 left-4 z-[500] flex flex-col items-start gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl shadow-2xl border border-ntz-blue/20 p-3 w-64 font-body"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ntz-dark">
                {allDone ? 'Upload complete' : 'Uploading photos…'}
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="text-ntz-light hover:text-ntz-dark transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-ntz-light truncate max-w-[180px]">{task.fileName}</span>
                    <span className="text-xs text-ntz-light ml-1 flex-shrink-0">
                      {task.error ? '✗' : task.done ? '✓' : `${Math.round(task.progress)}%`}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        task.error ? 'bg-red-400' : task.done ? 'bg-green-400' : 'bg-ntz-blue'
                      }`}
                      style={{ width: `${task.error ? 100 : task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circle badge */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(v => !v)}
        className="relative w-14 h-14 bg-white rounded-full shadow-2xl border border-ntz-blue/20 flex items-center justify-center"
        title={allDone ? 'Upload complete' : `Uploading… ${overallPercent}%`}
      >
        <svg width="56" height="56" className="absolute inset-0 -rotate-90">
          {/* Track */}
          <circle
            cx="28" cy="28" r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {/* Progress */}
          <circle
            cx="28" cy="28" r={RADIUS}
            fill="none"
            stroke={hasError ? '#f87171' : allDone ? '#4ade80' : '#7B8EF5'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>

        {allDone ? (
          <Check className="w-5 h-5 text-green-500 relative z-10" />
        ) : (
          <span className="text-xs font-bold text-ntz-dark relative z-10">{overallPercent}%</span>
        )}

        {/* Expand/collapse chevron */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-ntz-blue rounded-full flex items-center justify-center">
          {expanded
            ? <ChevronDown className="w-2.5 h-2.5 text-white" />
            : <ChevronUp className="w-2.5 h-2.5 text-white" />
          }
        </span>
      </motion.button>
    </div>
  )
}
