import { Link } from 'react-router-dom'
import Card from '../components/Card'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Expandable from '../components/Expandable'
import Button from '../components/Button'
import { type SubmissionResponse } from '../lib/api'
import AppBar from '../components/AppBar'


function loadLast(): SubmissionResponse | null {
  try {
    const raw = sessionStorage.getItem('last_submission_response')
    return raw ? (JSON.parse(raw) as SubmissionResponse) : null
  } catch {
    return null
  }
}

export default function Programme() {
  const last = loadLast()
  const easy = last?.coze_easyprogramme ?? undefined
  const detail = last?.coze_programme ?? undefined
  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="🧩 选题方案" showBack backTo="/result" />

      <div className="flex flex-col gap-4">
        <Card title="方案摘要">
          {easy ? (
            <MarkdownRenderer content={easy} />
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-gray-500">暂无方案摘要</div>
          )}
        </Card>

        <Expandable summary={<span>查看详细方案</span>}>
          {detail ? (
            <MarkdownRenderer content={detail} />
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-gray-500">暂无详细方案</div>
          )}
        </Expandable>
      </div>

      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t p-3">
        <div className="max-w-md mx-auto px-4 py-0 flex gap-3">
          <Link to="/result" className="flex-1">
            <Button variant="secondary" className="w-full">返回结果页</Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}