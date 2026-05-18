import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { DemoSection } from '@/components/sections/DemoSection'
import { CtaSection } from '@/components/sections/CtaSection'

export default function Home() {
  return (
    <main className="overflow-x-hidden relative">
      <HeroSection />
      <HowItWorksSection />
      <DemoSection />
      <CtaSection />
    </main>
  )
}
