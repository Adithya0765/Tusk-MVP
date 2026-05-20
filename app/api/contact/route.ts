import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  const toEmail = process.env.RESEND_FROM_EMAIL ?? process.env.NEXT_PUBLIC_APP_URL

  if (!resendKey || !toEmail) {
    // Silently succeed if email isn't configured — don't expose config state to users
    console.warn('[contact] RESEND_API_KEY or RESEND_FROM_EMAIL not set — email not sent')
    return NextResponse.json({ ok: true })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TUSK Contact <onboarding@resend.dev>',
      to: [toEmail],
      reply_to: email,
      subject: `Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    console.error('[contact] Resend error:', await res.text())
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
