// 前端 API 客户端：提交问卷到后端 /api/submissions

export type Challenge = { description: string; score: number };

export type Input = {
  nickname: string;
  role_tags?: string;
  recent_annoyance?: string;
  skills?: string;
  interest_score?: number;
  interest_description?: string;
  learning_attitude_sc?: number;
  people_around_challe?: string;
  community_voices?: string;
  collaboration_prefer?: 'A' | 'B' | 'C' | 'D';
  tool_idea?: string;
  confidence_score?: number;
  challenges?: Challenge[];
  learning_goal?: string;
};

export type SubmissionResponse = {
  submission_id: string;
  record_id?: string;
  coze_easyprogramme: string | null;
  coze_image: string | null;
  coze_programme: string | null;
  coze_report: string | null;
  debug_url?: string;
};

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:8000';

function generateUUID(): string {
  const g = (globalThis as any);
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  // 兼容环境：简单降级实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function submitSubmission(input: Input): Promise<SubmissionResponse> {
  const submission_id = generateUUID();
  const payload = {
    submission_id,
    _input: input,
    submitted_at: new Date().toISOString(),
  };

  const resp = await fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`提交失败(${resp.status}): ${text}`);
  }

  const data = await resp.json();
  return data as SubmissionResponse;
}