import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

export default function Input({ error, className, ...rest }: Props) {
  return (
    <div>
      <input
        {...rest}
        className={[
          'w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400',
          'border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error ? 'border-rose-400' : '',
          className || '',
        ].join(' ')}
      />
      {error ? (
        <div className="text-rose-600 text-sm mt-1" aria-live="polite">{error}</div>
      ) : null}
    </div>
  )
}