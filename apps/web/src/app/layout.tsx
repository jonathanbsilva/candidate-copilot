import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import { GoogleAnalytics } from '@/components/providers/google-analytics'
import { GoogleTagManager } from '@/components/providers/google-tag-manager'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'

const PostHogProvider = dynamic(
  () => import('@/components/providers/posthog-provider').then(mod => ({ default: mod.PostHogProvider })),
  { ssr: false }
)

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://copilot.gohire.work'),
  title: 'GoHire Copilot | Decisões de carreira com clareza',
  description: 'Responda algumas perguntas e receba um primeiro direcionamento baseado no seu contexto. Sem cadastro, sem enrolação.',
  openGraph: {
    title: 'GoHire Copilot | Decisões de carreira com clareza',
    description: 'Responda algumas perguntas e receba um direcionamento personalizado para sua carreira. Sem cadastro, sem enrolação.',
    url: 'https://copilot.gohire.work',
    siteName: 'GoHire Copilot',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GoHire Copilot - Decisões de carreira com clareza',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoHire Copilot | Decisões de carreira com clareza',
    description: 'Responda algumas perguntas e receba um direcionamento personalizado para sua carreira.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <GoogleTagManager />
        <GoogleAnalytics />
        <PostHogProvider>
          {children}
          <CookieConsentBanner />
        </PostHogProvider>
      </body>
    </html>
  )
}
