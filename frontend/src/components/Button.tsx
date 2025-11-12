import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = PropsWithChildren<{
  variant?: Variant
  className?: string
}> & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  const base = 'h-10 px-4 rounded-lg transition-colors duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none'
  const styles: Record<Variant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active',
    secondary: 'border border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-brand hover:text-brand-hover',
  }
  return (
    <button {...rest} className={cn(base, styles[variant], className)}>
      {children}
    </button>
  )
}