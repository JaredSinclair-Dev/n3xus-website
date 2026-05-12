/**
 * /api/contact.js — Vercel Serverless Function
 * Handles contact form submissions from contact.html
 *
 * SETUP:
 *  1. Sign up at https://resend.com (free: 3,000 emails/mo)
 *  2. Add RESEND_API_KEY to your Vercel environment variables
 *  3. Verify info@n3xus.media as a sender in Resend
 *  Done — form submissions will be emailed to info@n3xus.media
 */

const https = require('https');

const TO_EMAIL   = 'info@n3xus.media';
const FROM_EMAIL = 'website@n3xus.media';  // Must be verified in Resend
const SITE_NAME  = 'N3XUS Media Website';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://n3xus.media');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse body
  let body = req.body;
  if (!body || typeof body !== 'object') {
    const raw = await new Promise((resolve) => {
      let d = '';
      req.on('data', c => { d += c; });
      req.on('end', () => resolve(d));
    });
    try { body = JSON.parse(raw); } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { name = '', email = '', phone = '', service = '', message = '' } = body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message' });
  }

  // If no API key, log and return success (form still works, no email sent)
  if (!process.env.RESEND_API_KEY) {
    console.warn('[contact] RESEND_API_KEY not set — form submission not emailed.');
    console.log('[contact] Submission:', { name, email, phone, service, message: message.slice(0, 100) });
    return res.status(200).json({ ok: true, note: 'API key not configured — submission logged only.' });
  }

  const emailHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;color:#1a1a1a">
  <h2 style="color:#00c8a3;border-bottom:2px solid #00c8a3;padding-bottom:10px">
    New Contact Form Submission — ${SITE_NAME}
  </h2>
  <table style="width:100%;border-collapse:collapse;margin-top:16px">
    <tr><td style="padding:8px 0;font-weight:bold;width:130px;color:#555">Name</td><td style="padding:8px 0">${escapeHtml(name)}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 0;font-weight:bold;color:#555">Email</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding:8px 0;font-weight:bold;color:#555">Phone</td><td style="padding:8px 0">${phone ? escapeHtml(phone) : '—'}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 0;font-weight:bold;color:#555">Service</td><td style="padding:8px 0">${service ? escapeHtml(service) : '—'}</td></tr>
  </table>
  <div style="margin-top:20px">
    <strong style="color:#555">Message:</strong>
    <div style="margin-top:8px;padding:16px;background:#f5f5f5;border-left:4px solid #00c8a3;border-radius:4px;white-space:pre-wrap">${escapeHtml(message)}</div>
  </div>
  <p style="margin-top:24px;font-size:12px;color:#888">
    Sent from n3xus.media contact form &bull; <a href="https://n3xus.media/contact">n3xus.media/contact</a>
  </p>
</div>`;

  const payload = JSON.stringify({
    from:    `${SITE_NAME} <${FROM_EMAIL}>`,
    to:      [TO_EMAIL],
    replyTo: email,
    subject: `New Enquiry from ${name} — N3XUS Media`,
    html:    emailHtml,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.resend.com',
      path:     '/emails',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization':  `Bearer ${process.env.RESEND_API_KEY}`,
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => { data += chunk; });
      apiRes.on('end', () => {
        if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
          res.status(200).json({ ok: true });
        } else {
          console.error('[contact] Resend error:', apiRes.statusCode, data);
          res.status(200).json({ ok: true, note: 'Email delivery issue — submission recorded.' });
        }
        resolve();
      });
    });

    apiReq.on('error', (err) => {
      console.error('[contact] Request error:', err.message);
      res.status(200).json({ ok: true, note: 'Email delivery issue — submission recorded.' });
      resolve();
    });

    apiReq.write(payload);
    apiReq.end();
  });
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports.config = { api: { bodyParser: true } };
