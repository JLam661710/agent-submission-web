import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../../components/AppBar'
import Card from '../../components/Card'
import Textarea from '../../components/Textarea'
import Select from '../../components/Select'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import { loadDraft, saveDraft, computePercent, loadMeta, saveMeta } from '../../lib/form'
import type { Input as FormInput } from '../../lib/api'

const SELECT_OPTIONS = [
  { value: '', label: '请选择合作风格偏好' },
  { value: 'A', label: 'A. 我主导，他们辅助' },
  { value: 'B', label: 'B. 平等搭档，共同探索' },
  { value: 'C', label: 'C. 我提供灵感，他们落地' },
  { value: 'D', label: 'D. 其他（请说明）' },
]

export default function Nearby() {
  const navigate = useNavigate()
  const [input, setInput] = useState<FormInput>(() => loadDraft())
  const [customCollab, setCustomCollab] = useState<string>(() => (loadMeta().collaboration_prefer_note || ''))
  useEffect(() => { saveDraft(input) }, [input])
  useEffect(() => { saveMeta({ collaboration_prefer_note: customCollab }) }, [customCollab])
  const percent = computePercent(input)
  const setField = <K extends keyof FormInput>(k: K, v: FormInput[K]) => setInput(p => ({ ...p, [k]: v }))

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="👀 身边世界观察" showBack onBack={() => { saveDraft(input); saveMeta({ collaboration_prefer_note: customCollab }); navigate(-1) }} />
      <div className="max-w-md mx-auto px-4 mb-3"><ProgressBar percent={percent} /></div>
      <div className="flex flex-col gap-4">
        <Card title="引导">
          <p className="text-gray-700 leading-relaxed">
            现在，把镜头转向您身边的人——家人、朋友或同事。他们的日常故事可能藏着您没注意到的机会。让我们一起观察吧！
          </p>
        </Card>

        <Card title="身边人的日常挑战">
          <p className="text-gray-800 text-sm mb-1">想一位您常接触的人。他们每天在忙什么？有没有什么任务让他们觉得‘重复’或‘头疼’？请描述一下。</p>
          <p className="text-gray-500 text-sm mb-2">从具体人的日常切入，而非直接问“行业”，降低抽象度。</p>
          <Textarea value={input.people_around_challe || ''} onChange={e => setField('people_around_challe', e.currentTarget.value)} placeholder="他们的重复或头疼任务是什么？" />
        </Card>

        <Card title="社区共同声音">
          <p className="text-gray-800 text-sm mb-1">在你的社交圈/群体（例如：学习、职场、线上社区、线下店铺、兴趣社区等），大家常见的共同抱怨或需求是什么？请列出1-2个，并说明你认为的原因。</p>
          <p className="text-gray-500 text-sm mb-2">举例能降低理解难度，帮助聚焦群体性问题。</p>
          <Textarea value={input.community_voices || ''} onChange={e => setField('community_voices', e.currentTarget.value)} placeholder="示例：学习群体中信息太散乱；职场沟通效率低……" />
        </Card>

        <Card title="合作风格偏好">
          <p className="text-gray-800 text-sm mb-1">如果有一个创新项目，您更希望如何与身边人合作？</p>
          <p className="text-gray-500 text-sm mb-2">选择题用于简化分类。如选 D，出现说明输入框。</p>
          <Select value={input.collaboration_prefer || ''} onChange={e => setField('collaboration_prefer', (e.target.value || undefined) as any)} options={SELECT_OPTIONS} />
          {input.collaboration_prefer === 'D' ? (
            <div className="mt-2">
              <Textarea value={customCollab} onChange={e => setCustomCollab(e.currentTarget.value)} placeholder="请说明您的合作偏好" />
              <p className="text-xs text-gray-500 mt-1">说明仅用于页面提示，不随提交存储。</p>
            </div>
          ) : null}
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => { saveDraft(input); saveMeta({ collaboration_prefer_note: customCollab }); navigate('/q/daily') }}>返回上一步</Button>
          <Button className="flex-1" onClick={() => { saveDraft(input); saveMeta({ collaboration_prefer_note: customCollab }); navigate('/q/blueprint') }}>下一步：梦想与行动蓝图</Button>
        </div>
      </div>
    </div>
  )
}