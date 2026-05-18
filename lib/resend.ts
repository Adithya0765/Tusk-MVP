import { Resend } from 'resend'
import { createServerClient } from './supabase'

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Missing RESEND_API_KEY')
  return new Resend(key)
}

/** Escape HTML special characters to prevent injection in emails */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export async function sendDebateNotification(
  to: string,
  sessionId: string,
  status: 'complete' | 'failed'
): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const debateUrl = `${appUrl}/debate/${sessionId}`
  const from = process.env.RESEND_FROM_EMAIL ?? 'debates@tusk.ai'

  const subject =
    status === 'complete'
      ? '✅ Your TUSK debate is ready'
      : '❌ Your TUSK debate encountered an error'

  const safeDebateUrl = escapeHtml(debateUrl)

  const html =
    status === 'complete'
      ? `<p>Your debate has finished! <a href="${safeDebateUrl}">View the results →</a></p>`
      : `<p>Your debate failed to complete. <a href="${safeDebateUrl}">View details and try again →</a></p>`

  const supabase = createServerClient()
  let sendError: string | undefined

  try {
    const resend = getResendClient()
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) sendError = error.message
  } catch (err: any) {
    sendError = err?.message ?? 'Unknown error'
  }

  // Always log the attempt — success or failure
  await supabase.from('notifications_log').insert({
    session_id: sessionId,
    recipient: to,
    status: sendError ? 'failed' : 'sent',
    error_msg: sendError ?? null,
  })

  return sendError
    ? { success: false, error: sendError }
    : { success: true }
}
