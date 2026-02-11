import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
const PostHogProvider = dynamic(
  () => import('@/components/providers/posthog-provider').then(mod => ({ default: mod.PostHogProvider })),
  { ssr: false }
)

const GoogleAnalytics = dynamic(
  () => import('@/components/providers/google-analytics').then(mod => ({ default: mod.GoogleAnalytics })),
  { ssr: false }
)

const GoogleTagManager = dynamic(
  () => import('@/components/providers/google-tag-manager').then(mod => ({ default: mod.GoogleTagManager })),
  { ssr: false }
)

const CookieConsentBanner = dynamic(
  () => import('@/components/cookie-consent-banner').then(mod => ({ default: mod.CookieConsentBanner })),
  { ssr: false }
)

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
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
