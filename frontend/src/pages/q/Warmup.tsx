import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../../components/AppBar'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import { loadDraft, saveDraft, computePercent } from '../../lib/form'
import type { Input as FormInput } from '../../lib/api'

export default function Warmup() {
  const navigate = useNavigate()
  const [input, setInput] = useState<FormInput>(() => loadDraft())

  useEffect(() => { saveDraft(input) }, [input])

  const percent = computePercent(input)
  const setField = <K extends keyof FormInput>(k: K, v: FormInput[K]) => setInput(p => ({ ...p, [k]: v }))

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="👋 欢迎与热身" showBack backTo="/home" onBack={() => { saveDraft(input); navigate('/home') }} />
      <div className="max-w-md mx-auto px-4 mb-3"><ProgressBar percent={percent} /></div>

      <div className="flex flex-col gap-4">
        <Card title="引导">
          <p className="text-gray-700 leading-relaxed">
            欢迎来到“生活灵感挖掘机”！我是您的探索助手。我们将一起从您的日常小事出发，发现那些隐藏的智能机会。请放松，就像聊天一样～
          </p>
        </Card>

        <Card title="昵称识别（必填）">
          <p className="text-gray-800 text-sm mb-1">首先，请问我可以怎么称呼您？例如您的飞书昵称、花名，或任意您喜欢的代号。</p>
          <p className="text-gray-500 text-sm mb-2">简单身份识别，无需真实姓名。</p>
          <Input value={input.nickname || ''} onChange={e => setField('nickname', e.currentTarget.value)} placeholder="请填写您的昵称或代号" />
        </Card>

        <Card title="角色标签">
          <p className="text-gray-800 text-sm mb-1">现在，请用1-3个关键词描述您当前的角色（如‘学生’、‘创作者’、‘问题解决者’）。不必拘泥正式职称，随心就好！</p>
          <p className="text-gray-500 text-sm mb-2">用标签式提问降低压力，引导创意自我描述。</p>
          <Input value={input.role_tags || ''} onChange={e => setField('role_tags', e.currentTarget.value)} placeholder="例如：学生,创作者,问题解决者" />
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => { /* 导航前保存草稿 */ saveDraft(input); navigate('/home') }}>返回首页</Button>
          <Button className="flex-1" onClick={() => { /* 导航前保存草稿 */ saveDraft(input); navigate('/q/daily') }}>下一步：日常场景挖掘</Button>
        </div>
      </div>
    </div>
  )
}