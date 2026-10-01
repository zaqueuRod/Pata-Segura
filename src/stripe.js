import { loadStripe } from '@stripe/stripe-js'

// ✅ Coloque AQUI sua chave pública do Stripe
const CHAVE_PUBLICA = 'pk_test_51TwA3mAYLx0mzYZPOPvsPyDmZNbhsPWo0DQ3cZyuvUA7qTDsIQdjGs5rADng0N6EraYXYYN3HsgwVzgi4Onh0BB600FixF1WQ9'

export const stripePromise = loadStripe(CHAVE_PUBLICA)