export const CATEGORY_OPTIONS = [
  'Food',
  'Travel',
  'Bill Payments',
  'Money Transfer',
  'Shopping',
  'Groceries',
  'Rent',
  'Utilities',
  'Entertainment',
  'Health',
  'Education',
  'Other',
]

export const normalizeCategoryName = (value) => {
  const cleaned = String(value || '')
    .replace(/^#/, '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .trim()

  const aliasMap = {
    food: 'Food',
    travel: 'Travel',
    'bill payments': 'Bill Payments',
    'bill payment': 'Bill Payments',
    'money transfer': 'Money Transfer',
    shopping: 'Shopping',
    groceries: 'Groceries',
    grocery: 'Groceries',
    rent: 'Rent',
    utilities: 'Utilities',
    utility: 'Utilities',
    entertainment: 'Entertainment',
    health: 'Health',
    education: 'Education',
    other: 'Other',
  }

  return aliasMap[cleaned.toLowerCase()] || cleaned || 'Other'
}
