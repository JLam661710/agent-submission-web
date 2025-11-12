import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../../components/AppBar'
import Card from '../../components/Card'
import Textarea from '../../components/Textarea'
import Input from '../../components/Input'
import RadioGroup from '../../components/RadioGroup'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import { clampScore, loadDraft, saveDraft, computePercent } from '../../lib/form'
import { submitSubmission, type Input as FormInput, type SubmissionResponse } from '../../lib/api'

export default function Blueprint() {
  const navigate = useNavigate()
  const [input, setInput] = useState<FormInput>(() => loadDraft())
  const [submitting, setSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState<0 | 1 | 2>(0)

  useEffect(() => { saveDraft(input) }, [input])
  useEffect(() => {
    if (submitting) {
      setLoadingStep(1)
      const t = setTimeout(() => setLoadingStep(2), 800)
      return () => clearTimeout(t)
    } else {
      setLoadingStep(0)
    }
  }, [submitting])
  const percent = computePercent(input)
  const setField = <K extends keyof FormInput>(k: K, v: FormInput[K]) => setInput(p => ({ ...p, [k]: v }))

  const setChallenge = (idx: number, key: 'description' | 'score', v: any) => {
    setInput(prev => {
      const arr = Array.isArray(prev.challenges) ? [...prev.challenges] : []
      while (arr.length <= idx) arr.push({ description: '', score: 1 })
      const next = { ...arr[idx], [key]: key === 'score' ? (clampScore(v) || 1) : String(v) }
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

  const onSubmit = async () => {
    if (!input.nickname || !String(input.nickname).trim()) {
      alert('请先在“欢迎与热身”中填写昵称（必填）')
      return
    }
    try {
      setSubmitting(true)
      const resp: SubmissionResponse = await submitSubmission(input)
      try { sessionStorage.setItem('last_submission_response', JSON.stringify(resp)) } catch {}
      navigate('/result')
    } catch (err) {
      setSubmitting(false)
      alert(`提交失败：${String(err)}`)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <AppBar title="🌟 梦想与行动蓝图" showBack onBack={() => { saveDraft(input); navigate(-1) }} />
      <div className="max-w-md mx-auto px-4 mb-3"><ProgressBar percent={percent} /></div>
      {submitting && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-80 rounded-lg bg-white p-4 shadow-lg text-center">
            <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
            <div className="text-lg font-medium">正在提交与生成</div>
            <div className="text-sm text-gray-600 mt-1">{loadingStep === 1 ? '正在上传输入…' : '正在生成方案…'}</div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Card title="引导">
          <p className="text-gray-700 leading-relaxed">
            基于前面的探索，现在让我们畅想未来！您想创造什么来解决这些问题？别担心可行性，先聚焦“如果可能的话”。
          </p>
        </Card>

        <Card title="智能工具构想">
          <p className="text-gray-800 text-sm mb-1">请参考你用过或在市面上见过的优秀工具/方法/解决方案：哪些做法让你觉得有效？把这些启发应用到你的场景。也可以直接描述一个能解决你具体难题的理想方案（不必纠结实现过程）。</p>
          <p className="text-gray-500 text-sm mb-2">聚焦你期待的效果/改善（如省时、降错、提升体验），避免陷入实现细节。</p>
          <Textarea value={input.tool_idea || ''} onChange={e => setField('tool_idea', e.currentTarget.value)} placeholder="例如：我用过 X，它的 Y 做法很有效；我希望有个方案能帮我……" />
        </Card>

        <Card title="落地信心指数（1–5）">
          <p className="text-gray-800 text-sm mb-1">您觉得将这个构想变为现实的可能性有多大？请用1-5分打分（1=像做梦一样远，5=触手可及）。</p>
          <p className="text-gray-500 text-sm mb-2">打分评估信心。</p>
          <RadioGroup value={input.confidence_score} onChange={v => setField('confidence_score', v)} />
        </Card>

        <Card title="挑战雷达（1–3项）">
          <p className="text-gray-800 text-sm mb-1">实现构想时，您可能会遇到哪些障碍？请列出1-3个（如时间、技能），并用1-5分给每个障碍的难度打分（1=小问题，5=大难关）。</p>
          <p className="text-gray-500 text-sm mb-2">先开放列出，再打分，帮助理性评估。</p>
          {[0,1,2].map(i => (
            <div key={i} className="space-y-2 mb-3">
              <Textarea value={input.challenges?.[i]?.description || ''} onChange={e => setChallenge(i, 'description', e.currentTarget.value)} placeholder={`挑战 ${i+1}（例如：时间不足）`} />
              <RadioGroup value={input.challenges?.[i]?.score} onChange={v => setChallenge(i, 'score', v)} />
              {input.challenges && input.challenges[i] ? (
                <div>
                  <Button variant="secondary" onClick={() => removeChallenge(i)}>移除该项</Button>
                </div>
              ) : null}
            </div>
          ))}
        </Card>

        <Card title="学习指南针">
          <p className="text-gray-800 text-sm mb-1">最后，回顾整个探索，您下一步最想学习或加强什么来靠近这个构想？请用一句话总结（例如，‘我想学会用自动化工具节省时间’）。</p>
          <p className="text-gray-500 text-sm mb-2">收尾问题，提炼个人化学习目标。</p>
          <Input value={input.learning_goal || ''} onChange={e => setField('learning_goal', e.currentTarget.value)} placeholder="一句话总结下一步最想学什么" />
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => { /* 导航前保存草稿 */ saveDraft(input); navigate('/q/nearby') }}>返回上一步</Button>
          <Button className="flex-1" onClick={onSubmit} disabled={submitting}>提交</Button>
        </div>
      </div>
    </div>
  )
}