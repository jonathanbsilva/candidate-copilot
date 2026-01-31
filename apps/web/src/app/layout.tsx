import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { GoogleAnalytics } from '@/components/providers/google-analytics'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'

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
    <html lang="pt-BR">
      <body>
        <GoogleAnalytics />
        <PostHogProvider>
          {children}
          <CookieConsentBanner />
        </PostHogProvider>
      </body>
    </html>
  )
}
