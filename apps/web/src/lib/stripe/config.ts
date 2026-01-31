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
      '3 insights por mes',
      'Tracking manual ilimitado',
      'Copilot basico',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Insights ilimitados',
      'Tracking manual ilimitado',
      'Copilot avancado',
      'Entrevista IA',
      'Career Coach IA',
    ],
  },
} as const
