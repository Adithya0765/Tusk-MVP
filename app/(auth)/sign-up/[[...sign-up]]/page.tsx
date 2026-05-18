import { redirect } from 'next/navigation'

// Dev mode: no auth — go straight to dashboard
export default function SignUpPage() {
  redirect('/dashboard')
}
