export const STRIPE_CONFIG = {
  proPriceId: process.env.STRIPE_PRO_PRICE_ID!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '3 análises por mês',
      'Tracking manual ilimitado',
      'Copilot básico',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Análises ilimitadas',
      'Tracking manual ilimitado',
      'Copilot avançado',
      'Entrevista IA',
      'Career Coach IA',
    ],
  },
} as const
