/**
 * Email notifications via Resend.
 * Set RESEND_API_KEY and RESEND_FROM_EMAIL in your environment to enable.
 * If keys are missing, sendDebateNotification is a no-op.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendDebateNotification(
  to: string,
  sessionId: string,
  status: 'complete' | 'failed'
): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@tusk.ai'
  const url = escapeHtml(`${appUrl}/debate/${sessionId}`)

  const subject = status === 'complete'
    ? 'Your TUSK session is ready'
    : 'Your TUSK session encountered an error'

  const html = status === 'complete'
    ? `<p>Your session has finished. <a href="${url}">View the results →</a></p>`
    : `<p>Your session failed to complete. <a href="${url}">View details →</a></p>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  }).catch(() => {
    // Non-fatal — email failure should never break the debate flow
  })
}
