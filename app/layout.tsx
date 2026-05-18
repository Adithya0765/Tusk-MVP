import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import FooterSection from "@/components/footer"
import { HeroHeader } from "@/components/header"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'TUSK — AI Debate Platform',
  description: 'Submit any topic and watch two AI models debate it across multiple rounds. Get a structured conclusion with key points, tensions, and a final verdict.',
  openGraph: {
    title: 'TUSK — AI Debate Platform',
    description: 'Submit any topic and watch two AI models debate it. Get a structured verdict.',
    type: 'website',
    url: 'https://tusk.ai',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TUSK — AI Debate Platform',
    description: 'Submit any topic and watch two AI models debate it. Get a structured verdict.',
    images: ['/api/og'],
  },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${_geistMono.className} antialiased`}>
        <div className="fixed inset-0 -z-10 bg-[#0a0a0f]" />
        <HeroHeader />
        {children}
        <FooterSection />
        <Analytics />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(20,20,28,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </body>
    </html>
  )
}
