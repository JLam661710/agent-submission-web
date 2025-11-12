import React from 'react'

type Option = { value: string; label: string }
type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[]
  error?: string
}

export default function Select({ options, error, className, ...rest }: Props) {
  return (
    <div>
      <select
        {...rest}
        className={[
          'w-full h-10 rounded-md border pr-10 text-gray-900',
          'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error ? 'border-rose-400' : '',
          className || '',
        ].join(' ')}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error ? (
        <div className="text-rose-600 text-sm mt-1" aria-live="polite">{error}</div>
      ) : null}
    </div>
  )
}