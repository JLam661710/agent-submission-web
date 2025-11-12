export function generateUUID() {
  // Cloudflare Workers 环境可使用 crypto.getRandomValues；此处使用简单降级
  const random = (len: number) => Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => (b % 16).toString(16)).join('');
  const s = random(16);
  return `${s.slice(0,8)}-${s.slice(8,12)}-4${s.slice(13,16)}-${((parseInt(s.slice(16,17), 16) & 0x3) | 0x8).toString(16)}${s.slice(17,20)}-${s.slice(20,32)}`;
}

function pad2(n: number) { return n < 10 ? `0${n}` : `${n}` }
export function formatDateTime(date = new Date()) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeInput(raw: any) {
  const i: any = { ...(raw || {}) };
  const trimStr = (v: any) => (typeof v === 'string' ? v.trim() : v);
  const clamp = (n: any) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return undefined;
    return Math.min(5, Math.max(1, Math.round(x)));
  };

  i.nickname = trimStr(i.nickname);
  i.role_tags = trimStr(i.role_tags);
  i.recent_annoyance = trimStr(i.recent_annoyance);
  i.skills = trimStr(i.skills);
  i.interest_score = clamp(i.interest_score);
  i.interest_description = trimStr(i.interest_description);
  i.learning_attitude_sc = clamp(i.learning_attitude_sc);
  i.people_around_challe = trimStr(i.people_around_challe);
  i.community_voices = trimStr(i.community_voices);
  i.tool_idea = trimStr(i.tool_idea);
  i.confidence_score = clamp(i.confidence_score);
  i.learning_goal = trimStr(i.learning_goal);

  const collab = typeof i.collaboration_prefer === 'string' ? i.collaboration_prefer.trim().toUpperCase() : undefined;
  i.collaboration_prefer = ['A', 'B', 'C', 'D'].includes(collab as any) ? collab : undefined;

  type Challenge = { description?: string | null; score?: number | string | null };
  const arr: Challenge[] = Array.isArray(i.challenges) ? (i.challenges as Challenge[]).slice(0, 3) : [];
  i.challenges = arr
    .map((c: Challenge) => ({ description: trimStr(c?.description), score: clamp(c?.score) }))
    .filter((c: { description?: string; score?: number | undefined }) => !!c.description && !!c.score);

  return i;
}

type Mapping = { fields: Record<string, { name: string }> };
export function mapInputToFields(input: any, mapping: Mapping) {
  const fields = mapping.fields;
  const out: Record<string, any> = {};
  const set = (key: string, value: any) => {
    const f = (fields as any)[key];
    if (f && value !== undefined && value !== null && value !== '') out[f.name] = value;
  };

  set('nickname', input.nickname);
  set('role_tags', input.role_tags);
  set('recent_annoyance', input.recent_annoyance);
  set('skills', input.skills);
  set('interest_score', input.interest_score);
  set('interest_description', input.interest_description);
  set('learning_attitude_sc', input.learning_attitude_sc);
  set('people_around_challe', input.people_around_challe);
  set('community_voices', input.community_voices);
  set('collaboration_prefer', input.collaboration_prefer);
  set('tool_idea', input.tool_idea);
  set('confidence_score', input.confidence_score);
  set('learning_goal', input.learning_goal);

  const ch = Array.isArray(input.challenges) ? input.challenges : [];
  if (ch[0]) { set('challenge_1', ch[0].description); set('challenge_1_score', ch[0].score); }
  if (ch[1]) { set('challenge_2', ch[1].description); set('challenge_2_score', ch[1].score); }
  if (ch[2]) { set('challenge_3', ch[2].description); set('challenge_3_score', ch[2].score); }

  return out;
}

export function mapCozeToFields(cozeData: any, mapping: Mapping) {
  const fields = mapping.fields;
  const out: Record<string, any> = {};
  if (!cozeData) return out;
  if (typeof cozeData.easyprogramme === 'string') out[(fields as any).coze_easyprogramme.name] = cozeData.easyprogramme;
  if (typeof cozeData.image === 'string') {
    const val = cozeData.image.trim();
    if (isValidHttpUrl(val)) {
      out[(fields as any).coze_image.name] = { link: val, text: 'Coze 配图' };
    }
  }
  if (typeof cozeData.programme === 'string') out[(fields as any).coze_programme.name] = cozeData.programme;
  if (typeof cozeData.report === 'string') out[(fields as any).coze_report.name] = cozeData.report;
  return out;
}