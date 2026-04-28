'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LIMITE_FREE, TRIAL_DIAS } from '@/lib/stripe'

export default function AssinarPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)

  async function assinar() {
    setCarregando(true)
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: '#1C1712' }}>

      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full" style={{ background: '#C4823A' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#C4823A' }}>Despensa</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', color: '#F2EBE0' }}>
            Continue planejando
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#9B8B7A' }}>
            Você usou os {LIMITE_FREE} planejamentos gratuitos.<br />
            Assine para planejamentos ilimitados.
          </p>
        </div>

        {/* Card do plano */}
        <div className="rounded-3xl p-6 mb-6" style={{ background: '#252015', border: '1.5px solid #C4823A' }}>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="font-bold text-lg" style={{ color: '#F2EBE0' }}>Despensa Pro</p>
              <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>Casa de Aluguel</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: '#F2EBE0' }}>R$350</p>
              <p className="text-xs" style={{ color: '#9B8B7A' }}>/mês</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {[
              'Planejamentos ilimitados',
              'Todos os dias e refeições',
              'Lista de compras com PDF e WhatsApp',
              'Busca de receitas por IA',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#C4823A' }}>
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm" style={{ color: '#F2EBE0' }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 rounded-2xl mb-5 text-center" style={{ background: '#2A2118' }}>
            <p className="text-sm font-semibold" style={{ color: '#C4823A' }}>
              {TRIAL_DIAS} dias grátis
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>
              Cartão solicitado · cobrança apenas após o período de teste
            </p>
          </div>

          <button onClick={assinar} disabled={carregando}
            className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-60"
            style={{ background: '#C4823A', color: '#fff' }}>
            {carregando ? 'Redirecionando...' : `Começar ${TRIAL_DIAS} dias grátis`}
          </button>
        </div>

        <Link href="/dashboard"
          className="block text-center text-sm py-2"
          style={{ color: '#9B8B7A' }}>
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
