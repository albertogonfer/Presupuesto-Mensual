import type { ReactNode } from 'react'
import { CATEGORY_ICON_OPTIONS } from './categoryIcons'

const ICONS_BY_NAME = new Map(CATEGORY_ICON_OPTIONS.map((o) => [o.name, o.Icon]))

type CategoryIconProps = {
  icon: string
  className?: string
}

// Renders a lucide icon when `icon` is a known name; legacy categories
// stored emojis, which are rendered as plain text instead.
export function CategoryIcon({ icon, className = 'h-4 w-4' }: CategoryIconProps): ReactNode {
  const Icon = ICONS_BY_NAME.get(icon)
  if (!Icon) return <span aria-hidden>{icon}</span>
  return <Icon aria-hidden className={className} />
}
