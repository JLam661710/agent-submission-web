import { useNavigate } from 'react-router-dom'

type Props = {
  title: string
  showBack?: boolean
  backTo?: string | number
  onBack?: () => void
}

export default function AppBar({ title, showBack = false, backTo = -1, onBack }: Props) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-brand via-brand-hover to-brand-active text-white shadow-md">
      <div className="relative max-w-md mx-auto px-4 py-3">
        {showBack ? (
          <button
            aria-label="返回"
            onClick={() => {
              if (onBack) return onBack()
              return typeof backTo === 'string' ? navigate(backTo) : navigate(backTo as number)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 px-2 text-white hover:text-white/90"
          >返回</button>
        ) : null}
        <h1 className="text-xl font-semibold text-center">{title}</h1>
      </div>
    </header>
  )}