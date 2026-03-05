export const PIN_CATEGORIES = [
  { id: 'general',       label: 'General',        emoji: '⭐' },
  { id: 'food',          label: 'Food & Dining',  emoji: '🍽️' },
  { id: 'nature',        label: 'Nature',         emoji: '🌿' },
  { id: 'historic',      label: 'Historic',       emoji: '🏛️' },
  { id: 'beach',         label: 'Beach',          emoji: '🏖️' },
  { id: 'shopping',      label: 'Shopping',       emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment',  emoji: '🎭' },
  { id: 'religious',     label: 'Religious',      emoji: '🕍' },
  { id: 'viewpoint',     label: 'Viewpoint',      emoji: '🔭' },
  { id: 'accommodation', label: 'Accommodation',  emoji: '🏨' },
  { id: 'sport',         label: 'Sport',          emoji: '🏃' },
  { id: 'art',           label: 'Art & Culture',  emoji: '🎨' },
]

export function getCategoryById(id) {
  return PIN_CATEGORIES.find((c) => c.id === id) || PIN_CATEGORIES[0]
}
