import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '../lib/utils'

type Props = PropsWithChildren<{ className?: string; title?: string; actions?: ReactNode }>

export default function Card({ className, title, actions, children }: Props) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  )
}