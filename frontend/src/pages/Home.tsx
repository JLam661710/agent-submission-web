import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import AppBar from '../components/AppBar'
import { loadDraft } from '../lib/form'

export default function Home() {
  const navigate = useNavigate()
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    const d = loadDraft()
    setHasDraft(Boolean(d && d.nickname))
  }, [])

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="🏠 智能体开发选题灵感大师" />
      <div className="flex flex-col gap-4">
        <Card title="欢迎">
          <p className="text-gray-700 leading-relaxed">
            欢迎来到“生活灵感挖掘机”！我是您的探索助手。我们将一起从您的日常小事出发，发现那些隐藏的智能机会。请放松，就像聊天一样～
          </p>
        </Card>

        <Card title="开始探索">
          <p className="text-gray-700 leading-relaxed">
            本问卷共分为四个部分：欢迎与热身、日常场景挖掘、身边世界观察、梦想与行动蓝图。每部分包含引导与问题说明，陪伴您娓娓道来地梳理想法。
          </p>
          <div className="mt-3 flex gap-3">
            <Button className="flex-1" onClick={() => navigate('/q/warmup')}>开始填写</Button>
            {hasDraft ? (
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/q/warmup')}>继续上次草稿</Button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}