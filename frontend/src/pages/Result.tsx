import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppBar from '../components/AppBar'
import Card from '../components/Card'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Button from '../components/Button'
import { type SubmissionResponse } from '../lib/api'


export default function Result() {
  const [data, setData] = useState<SubmissionResponse | null>(null)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('last_submission_response')
      setData(raw ? JSON.parse(raw) as SubmissionResponse : null)
    } catch {
      setData(null)
    }
  }, [])

  const report = data?.coze_report ?? null
  const image = data?.coze_image ?? null

  const copyReport = async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report)
      alert('已复制报告文本')
    } catch {
      alert('复制失败，请手动选择复制')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="📊 结果页" />

      <div className="flex flex-col gap-4">
        <Card title="📝 相关性话题报告">
          {report ? (
            <MarkdownRenderer content={report} />
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-gray-500">暂无报告，请先填写问卷并提交</div>
          )}
          <div className="mt-3 flex gap-2">
            <Button onClick={copyReport}>复制报告文本</Button>
          </div>
        </Card>

        <Card title="🖼️ 配图预览">
          {image ? (
            <div className="aspect-square w-full rounded bg-gray-100 overflow-hidden">
              <img
                className="w-full h-full object-contain"
                src={image}
                alt="配图"
                onError={(e) => { (e.currentTarget.style.display = 'none') }}
              />
            </div>
          ) : (
            <div className="aspect-square w-full rounded-lg border border-dashed text-center text-gray-500 flex items-center justify-center">
              暂无图片
            </div>
          )}
        </Card>
      </div>

      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t p-3">
        <div className="max-w-md mx-auto px-4 py-0 flex gap-3">
          <Link to="/programme" className="flex-1">
            <Button className="w-full">查看选题方案</Button>
          </Link>
          <Link to="/home" className="flex-1">
            <Button variant="secondary" className="w-full">返回首页重新填写</Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}