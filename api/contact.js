import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TEAM_EMAIL = process.env.CONTACT_TEAM_EMAIL || 'josef.cipera@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    // 1. Notify team
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TEAM_EMAIL,
      subject: `[CHJ Kontakt] ${name}`,
      html: `
        <div style="font-family:monospace;background:#02040a;color:#e2e8f0;padding:2rem;border-left:3px solid #06b6d4;">
          <p style="color:#06b6d4;margin:0 0 1rem;">// CHJ_CONTACT_TERMINAL — nová zpráva</p>
          <p><strong>Jméno:</strong> ${name}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${email}" style="color:#06b6d4">${email}</a></p>
          <p><strong>Zpráva:</strong></p>
          <p style="background:#0f172a;padding:1rem;border-radius:6px;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    // 2. Autoresponder — disabled until iting.cz domain verified in Resend

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Contact email error:', JSON.stringify(err));
    return res.status(500).json({ error: err?.message || 'Failed to send', detail: JSON.stringify(err) });
  }
}
