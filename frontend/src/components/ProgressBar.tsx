type Props = { percent: number }

export default function ProgressBar({ percent }: Props) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className="h-1 bg-gray-100">
      <div className="h-1 bg-indigo-600" style={{ width: `${p}%` }} />
    </div>
  )
}