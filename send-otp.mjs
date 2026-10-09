// Sends an 8-digit verification code to YOUR recovery email (RECOVERY_EMAIL env var).
// Stateless: the code is never stored; it is bound into an HMAC-signed token that verify-otp checks.
import { createHmac, randomInt, randomBytes } from 'node:crypto';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const sign = (secret, exp, nonce, code) => createHmac('sha256', secret).update(`${exp}.${nonce}.${code}`).digest('base64url');

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const { RESEND_API_KEY: key, OTP_SECRET: secret, RECOVERY_EMAIL: to } = process.env;
  if (!key || !secret || !to) return json({ error: 'not_configured' }, 503);

  const code = String(randomInt(0, 100000000)).padStart(8, '0');
  const exp = Date.now() + 10 * 60 * 1000;
  const nonce = randomBytes(9).toString('base64url');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Attendance Tracker <onboarding@resend.dev>',
      to: [to],
      subject: 'Your attendance tracker verification code',
      text: `Your verification code is ${code}\n\nIt expires in 10 minutes. If you did not request it, ignore this email: nothing changes and your attendance data is safe.`,
    }),
  });
  if (!r.ok) return json({ error: 'email_failed' }, 502);
  // The destination is fixed server-side (RECOVERY_EMAIL), so this endpoint cannot be used to mail other people.
  return json({ token: `${exp}.${nonce}.${sign(secret, exp, nonce, code)}` });
};
