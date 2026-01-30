export const FREE_INSIGHTS_LIMIT = 3
export const FREE_APPLICATIONS_LIMIT = 5
export const FREE_COPILOT_DAILY_LIMIT = 5
export const FREE_INTERVIEWS_LIMIT = 1 // Trial vitalicio (nao reseta mensalmente)
export const PRO_FEATURES = ['interview_pro', 'career_coach'] as const
export type ProFeature = (typeof PRO_FEATURES)[number]
