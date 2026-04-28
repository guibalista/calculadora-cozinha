import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe, TRIAL_DIAS } from '@/lib/stripe'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .single()

  if (sub?.status === 'active' || sub?.status === 'trialing') {
    return NextResponse.json({ error: 'já tem assinatura ativa' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_collection: 'always',
    customer_email: sub?.stripe_customer_id ? undefined : user.email!,
    customer: sub?.stripe_customer_id ?? undefined,
    subscription_data: {
      trial_period_days: TRIAL_DIAS,
      metadata: { user_id: user.id },
    },
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?assinatura=ativa`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinar`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}
