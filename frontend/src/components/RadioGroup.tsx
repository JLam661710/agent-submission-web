type Props = {
  value?: number
  onChange?: (v: number) => void
  labels?: string[]
}

export default function RadioGroup({ value, onChange, labels }: Props) {
  const items = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-2">
      {items.map(n => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          onClick={() => onChange?.(n)}
          className={[
            'w-10 h-10 rounded-full flex items-center justify-center border transition-colors',
            value === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-300',
          ].join(' ')}
        >
          {n}
        </button>
      ))}
      {labels && labels.length === 5 ? (
        <div className="ml-2 text-sm text-gray-500">{labels[value ? value - 1 : 2]}</div>
      ) : null}
    </div>
  )
}