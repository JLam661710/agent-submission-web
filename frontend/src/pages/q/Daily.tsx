import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../../components/AppBar'
import Card from '../../components/Card'
import Textarea from '../../components/Textarea'
import Input from '../../components/Input'
import RadioGroup from '../../components/RadioGroup'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import { loadDraft, saveDraft, computePercent } from '../../lib/form'
import type { Input as FormInput } from '../../lib/api'

export default function Daily() {
  const navigate = useNavigate()
  const [input, setInput] = useState<FormInput>(() => loadDraft())
  useEffect(() => { saveDraft(input) }, [input])
  const percent = computePercent(input)
  const setField = <K extends keyof FormInput>(k: K, v: FormInput[K]) => setInput(p => ({ ...p, [k]: v }))

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="🔍 日常场景挖掘" showBack onBack={() => { saveDraft(input); navigate(-1) }} />
      <div className="max-w-md mx-auto px-4 mb-3"><ProgressBar percent={percent} /></div>
      <div className="flex flex-col gap-4">
        <Card title="引导">
          <p className="text-gray-700 leading-relaxed">
            想象您正在回顾上周的生活。那些小瞬间——比如工作中的重复任务、学习中的卡点——也许正是灵感的种子。让我们从这些具体场景开始吧！
          </p>
        </Card>

        <Card title="最近的小烦恼">
          <p className="text-gray-800 text-sm mb-1">回想最近几天，有没有哪件小事让您觉得‘太耗时了’或‘可以更聪明点’？请描述这个场景（例如，‘每天手动整理文件很麻烦’）。</p>
          <p className="text-gray-500 text-sm mb-2">从具体烦恼出发，作为思维钩子，引导您思考改进需求。</p>
          <Textarea value={input.recent_annoyance || ''} onChange={e => setField('recent_annoyance', e.currentTarget.value)} placeholder="例如：每天手动整理文件很麻烦" />
        </Card>

        <Card title="技能超能力">
          <p className="text-gray-800 text-sm mb-1">每个人都有自己的‘超能力’！您最得意的技能或知识是什么？请列出1-2项，并说说它们如何在实际生活中帮到您（比如，‘我擅长组织信息，让团队会议更高效’）。</p>
          <p className="text-gray-500 text-sm mb-2">连接技能与具体应用场景，避免抽象罗列。</p>
          <Textarea value={input.skills || ''} onChange={e => setField('skills', e.currentTarget.value)} placeholder="例如：擅长组织信息，让会议更高效" />
        </Card>

        <Card title="兴趣热度计（1–5）">
          <p className="text-gray-800 text-sm mb-1">请先填写你感兴趣的领域或事物，然后为兴趣热度打分（1=偶尔看看，5=深度沉迷）。</p>
          <p className="text-gray-500 text-sm mb-2">第一步：输入兴趣对象；第二步：打分热度。</p>
          <Input value={input.interest_description || ''} onChange={e => setField('interest_description', e.currentTarget.value)} placeholder="你对什么领域或事物感兴趣？例如：AI绘画 / 园艺 / 信息组织" />
          <div className="mt-2"><RadioGroup value={input.interest_score} onChange={v => setField('interest_score', v)} /></div>
        </Card>

        <Card title="学习新事物态度（1–5）">
          <p className="text-gray-800 text-sm mb-1">当遇到AI这类新技术时，您的本能反应是？请用1-5分打分（1=保持距离，5=主动拥抱）。</p>
          <p className="text-gray-500 text-sm mb-2">简单打分，评估开放程度。</p>
          <RadioGroup value={input.learning_attitude_sc} onChange={v => setField('learning_attitude_sc', v)} />
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => { saveDraft(input); navigate('/q/warmup') }}>返回上一步</Button>
          <Button className="flex-1" onClick={() => { saveDraft(input); navigate('/q/nearby') }}>下一步：身边世界观察</Button>
        </div>
      </div>
    </div>
  )
}