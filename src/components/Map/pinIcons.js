export const PIN_CATEGORIES = [
  { id: 'general',       label: 'General',        emoji: '⭐' },
  { id: 'food',          label: 'Food & Dining',  emoji: '🍽️' },
  { id: 'cafe',          label: 'Café & Coffee',  emoji: '☕' },
  { id: 'nature',        label: 'Nature',         emoji: '🌿' },
  { id: 'historic',      label: 'Historic',       emoji: '🏛️' },
  { id: 'beach',         label: 'Beach',          emoji: '🏖️' },
  { id: 'shopping',      label: 'Shopping',       emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment',  emoji: '🎭' },
  { id: 'nightlife',     label: 'Nightlife',      emoji: '🍸' },
  { id: 'religious',     label: 'Religious',      emoji: '🕍' },
  { id: 'viewpoint',     label: 'Viewpoint',      emoji: '🔭' },
  { id: 'accommodation', label: 'Accommodation',  emoji: '🏨' },
  { id: 'sport',         label: 'Sport',          emoji: '🏃' },
  { id: 'art',           label: 'Art & Culture',  emoji: '🎨' },
  { id: 'music',         label: 'Music',          emoji: '🎵' },
  { id: 'market',        label: 'Market',         emoji: '🏪' },
  { id: 'park',          label: 'Park & Garden',  emoji: '🌳' },
  { id: 'photo',         label: 'Photo Spot',     emoji: '📸' },
  { id: 'hidden',        label: 'Hidden Gem',     emoji: '💎' },
  { id: 'kids',          label: 'Kids & Family',  emoji: '🎠' },
  { id: 'medical',       label: 'Medical',        emoji: '🏥' },
  { id: 'transport',     label: 'Transport',      emoji: '🚌' },
  { id: 'memorial',      label: 'Memorial',       emoji: '🕯️' },
  { id: 'winery',        label: 'Winery',         emoji: '🍷' },
]

export function getCategoryById(id) {
  return PIN_CATEGORIES.find((c) => c.id === id) || PIN_CATEGORIES[0]
}
