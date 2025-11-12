import { useState } from 'react'
import { cn } from '../lib/utils'

type Props = {
  summary: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
}

export default function Expandable({ summary, children, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div className="rounded-lg border overflow-hidden">
      <button
        className={cn('w-full p-4 flex items-center justify-between text-left', expanded && 'bg-gray-50')}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="font-medium text-gray-900">{summary}</div>
        <span className={cn('transition-transform', expanded ? 'rotate-180' : 'rotate-0')}>⌄</span>
      </button>
      <div className={cn('transition-all', expanded ? 'max-h-[1000px]' : 'max-h-0')}>
        <div className={cn('p-4', expanded ? 'opacity-100' : 'opacity-0')}>{children}</div>
      </div>
    </div>
  )
}