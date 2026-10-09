import { createHmac, timingSafeEqual } from 'node:crypto';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const sign = (secret, exp, nonce, code) => createHmac('sha256', secret).update(`${exp}.${nonce}.${code}`).digest('base64url');

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const secret = process.env.OTP_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || ''), parts = String(body.token || '').split('.');
  if (!/^\d{8}$/.test(code) || parts.length !== 3) return json({ ok: false, error: 'bad_request' }, 400);
  const [exp, nonce, sig] = parts;
  if (!(Number(exp) > Date.now())) return json({ ok: false, error: 'expired' }, 400);
  const a = Buffer.from(sign(secret, exp, nonce, code)), b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json({ ok: false, error: 'wrong' }, 400);
  return json({ ok: true });
};
