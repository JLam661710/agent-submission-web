import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Select from '../components/Select'
import RadioGroup from '../components/RadioGroup'
import ProgressBar from '../components/ProgressBar'
import Button from '../components/Button'
import { submitSubmission, type Input as FormInput, type SubmissionResponse } from '../lib/api'

type Errors = Partial<Record<keyof FormInput | `challenge_${number}_description` | `challenge_${number}_score`, string>>

const SELECT_OPTIONS = [
  { value: '', label: '请选择合作风格偏好' },
  { value: 'A', label: 'A. 我主导，他们辅助' },
  { value: 'B', label: 'B. 平等搭档，共同探索' },
  { value: 'C', label: 'C. 我提供灵感，他们落地' },
  { value: 'D', label: 'D. 其他（请说明）' },
]

const DRAFT_KEY = 'questionnaire_draft'

function clampScore(n: any): number | undefined {
  const x = Number(n)
  if (!Number.isFinite(x)) return undefined
  return Math.min(5, Math.max(1, Math.round(x)))
}

function validate(input: FormInput): Errors {
  const e: Errors = {}
  if (!input.nickname || !String(input.nickname).trim()) e.nickname = '请填写昵称（必填）'
  const checkRange = (k: keyof FormInput) => {
    const v = (input as any)[k]
    if (v === undefined || v === null || v === '') return
    const c = clampScore(v)
    if (!c) e[k] = '分值需在 1–5 之间'
  }
  ;['interest_score', 'learning_attitude_sc', 'confidence_score'].forEach(k => checkRange(k as keyof FormInput))
  if (Array.isArray(input.challenges)) {
    if (input.challenges.length > 3) {
      e.challenges = '最多填写 3 项挑战'
    }
    input.challenges.forEach((c, idx) => {
      if (!c.description || !String(c.description).trim()) e[`challenge_${idx + 1}_description`] = '请填写挑战描述'
      if (!clampScore(c.score)) e[`challenge_${idx + 1}_score`] = '分值需在 1–5 之间'
    })
  }
  if (input.collaboration_prefer && !['A', 'B', 'C', 'D'].includes(input.collaboration_prefer)) {
    e.collaboration_prefer = '请选择 A/B/C/D'
  }
  return e
}

export default function Questionnaire() {
  const navigate = useNavigate()
  const [input, setInput] = useState<FormInput>({ nickname: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [restoredTip, setRestoredTip] = useState(false)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const data = JSON.parse(raw) as FormInput
        setInput(data)
        setRestoredTip(true)
        setTimeout(() => setRestoredTip(false), 2000)
      }
    } catch (_) {}
  }, [])

  const setField = <K extends keyof FormInput>(k: K, v: FormInput[K]) => {
    setInput(prev => ({ ...prev, [k]: v }))
  }

  const setChallenge = (idx: number, key: 'description' | 'score', v: any) => {
    setInput(prev => {
      const arr = Array.isArray(prev.challenges) ? [...prev.challenges] : []
      while (arr.length <= idx) arr.push({ description: '', score: 1 })
      const next = { ...arr[idx], [key]: key === 'score' ? clampScore(v) || 1 : String(v) }
      arr[idx] = next
      return { ...prev, challenges: arr }
    })
  }

  const removeChallenge = (idx: number) => {
    setInput(prev => {
      const arr = Array.isArray(prev.challenges) ? prev.challenges.slice() : []
      arr.splice(idx, 1)
      return { ...prev, challenges: arr }
    })
  }

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    setSaving(true)
    saveTimer.current = window.setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(input)) } catch (_) {}
      setSaving(false)
    }, 400)
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current) }
  }, [input])

  const percent = useMemo(() => {
    const keys: (keyof FormInput)[] = [
      'nickname','role_tags','recent_annoyance','skills','interest_score','interest_description','learning_attitude_sc','people_around_challe','community_voices','collaboration_prefer','tool_idea','confidence_score','learning_goal'
    ]
    const filled = keys.filter(k => {
      const v = (input as any)[k]
      return v !== undefined && v !== null && String(v).trim() !== ''
    }).length
    return Math.round((filled / keys.length) * 100)
  }, [input])

  const onSubmit = async () => {
    const e = validate(input)
    setErrors(e)
    const hasError = Object.keys(e).length > 0
    if (hasError) return
    try {
      setSubmitted(true)
      const resp: SubmissionResponse = await submitSubmission(input)
      try { sessionStorage.setItem('last_submission_response', JSON.stringify(resp)) } catch (_) {}
      navigate('/result')
    } catch (err) {
      setSubmitted(false)
      alert(`提交失败：${String(err)}`)
    }
  }

  const disable = submitted

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">问卷填写</h1>
          <div className="mt-2"><ProgressBar percent={percent} /></div>
          {restoredTip && <div className="mt-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 p-2 text-sm">已从草稿恢复</div>}
          {saving && <div className="mt-2 text-xs text-gray-500">正在保存草稿…</div>}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <Card title="昵称（必填）">
          <Input disabled={disable} value={input.nickname || ''} onChange={e => setField('nickname', e.currentTarget.value)} placeholder="请输入昵称" error={errors.nickname} />
        </Card>

        <Card title="角色标签">
          <Input disabled={disable} value={input.role_tags || ''} onChange={e => setField('role_tags', e.currentTarget.value)} placeholder="例如：学生,创作者" />
        </Card>

        <Card title="最近的小烦恼">
          <Textarea disabled={disable} value={input.recent_annoyance || ''} onChange={e => setField('recent_annoyance', e.currentTarget.value)} placeholder="例如：每天手动整理文件很麻烦" />
        </Card>

        <Card title="技能超能力">
          <Textarea disabled={disable} value={input.skills || ''} onChange={e => setField('skills', e.currentTarget.value)} placeholder="例如：擅长组织信息，让会议更高效" />
        </Card>

        <Card title="兴趣热度计（1–5）">
          <RadioGroup value={input.interest_score} onChange={v => setField('interest_score', v)} />
          {errors.interest_score ? <div className="text-rose-600 text-sm mt-1" aria-live="polite">{errors.interest_score}</div> : null}
          <Input disabled={disable} className="mt-2" value={input.interest_description || ''} onChange={e => setField('interest_description', e.currentTarget.value)} placeholder="简述原因" />
        </Card>

        <Card title="学习新事物态度（1–5）">
          <RadioGroup value={input.learning_attitude_sc} onChange={v => setField('learning_attitude_sc', v)} />
          {errors.learning_attitude_sc ? <div className="text-rose-600 text-sm mt-1" aria-live="polite">{errors.learning_attitude_sc}</div> : null}
        </Card>

        <Card title="身边人的日常挑战">
          <Textarea disabled={disable} value={input.people_around_challe || ''} onChange={e => setField('people_around_challe', e.currentTarget.value)} placeholder="他们的重复或头疼任务是什么？" />
        </Card>

        <Card title="社区共同声音">
          <Textarea disabled={disable} value={input.community_voices || ''} onChange={e => setField('community_voices', e.currentTarget.value)} placeholder="例如：信息太散乱，沟通效率低" />
        </Card>

        <Card title="合作风格偏好">
          <Select disabled={disable} value={input.collaboration_prefer || ''} onChange={e => setField('collaboration_prefer', (e.target.value || undefined) as any)} options={SELECT_OPTIONS} />
          {errors.collaboration_prefer ? <div className="text-rose-600 text-sm mt-1" aria-live="polite">{errors.collaboration_prefer}</div> : null}
        </Card>

        <Card title="智能工具构想">
          <Textarea disabled={disable} value={input.tool_idea || ''} onChange={e => setField('tool_idea', e.currentTarget.value)} placeholder="它会做什么？使用场景是？" />
        </Card>

        <Card title="落地信心指数（1–5）">
          <RadioGroup value={input.confidence_score} onChange={v => setField('confidence_score', v)} />
          {errors.confidence_score ? <div className="text-rose-600 text-sm mt-1" aria-live="polite">{errors.confidence_score}</div> : null}
        </Card>

        <Card title="挑战雷达（1–3项）">
          {[0,1,2].map(i => (
            <div key={i} className="space-y-2 mb-3">
              <Textarea disabled={disable} value={input.challenges?.[i]?.description || ''} onChange={e => setChallenge(i, 'description', e.currentTarget.value)} placeholder={`挑战 ${i+1}（例如：时间不足）`} />
              <RadioGroup value={input.challenges?.[i]?.score} onChange={v => setChallenge(i, 'score', v)} />
              {(errors as any)[`challenge_${i+1}_description`] ? <div className="text-rose-600 text-sm" aria-live="polite">{(errors as any)[`challenge_${i+1}_description`]}</div> : null}
              {(errors as any)[`challenge_${i+1}_score`] ? <div className="text-rose-600 text-sm" aria-live="polite">{(errors as any)[`challenge_${i+1}_score`]}</div> : null}
              {input.challenges && input.challenges[i] ? (
                <div>
                  <Button variant="secondary" onClick={() => removeChallenge(i)} disabled={disable}>移除该项</Button>
                </div>
              ) : null}
            </div>
          ))}
          {errors.challenges ? <div className="text-rose-600 text-sm mt-1" aria-live="polite">{errors.challenges}</div> : null}
        </Card>

        <Card title="学习指南针">
          <Input disabled={disable} value={input.learning_goal || ''} onChange={e => setField('learning_goal', e.currentTarget.value)} placeholder="一句话总结下一步最想学什么" />
        </Card>
      </div>

      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t p-3">
        <div className="max-w-md mx-auto px-4 py-0 flex gap-3">
          <Button className="flex-1" onClick={onSubmit} disabled={disable}>提交</Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/result')}>查看结果</Button>
        </div>
      </footer>
    </div>
  )
}