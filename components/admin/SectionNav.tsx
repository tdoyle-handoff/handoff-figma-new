import React from 'react'
import { cn } from '../ui/utils'
import { LucideIcon } from 'lucide-react'

export type SectionNavItem = {
  key: string
  label: string
  icon?: LucideIcon
  disabled?: boolean
}

interface SectionNavProps {
  items: SectionNavItem[]
  activeKey: string
  onChange?: (key: string) => void
  className?: string
}

// Vertical section navigation used at the left of the content area
export default function SectionNav({ items, activeKey, onChange, className }: SectionNavProps) {
  return (
    <nav className={cn('space-y-1', className)}>
      {items.map((item) => {
        const Icon = item.icon
        const active = item.key === activeKey
        return (
          <button
            key={item.key}
            onClick={() => !item.disabled && onChange?.(item.key)}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors',
              active
                ? 'bg-white border-border shadow-sm text-foreground'
                : 'bg-transparent border-transparent hover:bg-muted text-muted-foreground',
              item.disabled && 'opacity-60 cursor-not-allowed'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

