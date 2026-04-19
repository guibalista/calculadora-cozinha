'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numeroDias: number }
interface Evento { id: string; nome: string; tipoEvento?: string; data?: string; totalPessoas: number }
interface Pousada { id: string; nome: string; totalQuartos: number }

const MODULOS = [
  { href: '/estadia/nova', label: 'Casa de Aluguel', desc: 'Airbnb, temporada e chalés', badge: 'Casas' },
  { href: '/receita/nova', label: 'Eventos', desc: 'Festas, casamentos e catering', badge: 'Eventos' },
  { href: '/pousada/nova', label: 'Pousada', desc: 'B&B, chalés e pousadas', badge: 'Pousadas' },
]

const TIPO_LABELS: Record<string, string> = {
  churrasco: 'Churrasco', casamento: 'Casamento', formatura: 'Formatura',
  aniversario: 'Aniversário', corporativo: 'Corporativo',
  almoco: 'Almoço', jantar: 'Jantar', brunch: 'Brunch', outro: 'Evento',
}

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [pousadas, setPousadas] = useState<Pousada[]>([])
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    setEstadias(JSON.parse(localStorage.getItem('estadias') || '[]'))
    setEventos(JSON.parse(localStorage.getItem('eventos') || '[]'))
    setPousadas(JSON.parse(localStorage.getItem('pousadas') || '[]'))
  }, [])

  const total = estadias.length + eventos.length + pousadas.length

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>

      <header className="mb-8">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#1A2E25' }}>Despensa</span>
        <p className="text-sm mt-0.5" style={{ color: '#7BA892' }}>Assertividade nas compras</p>
      </header>

      {/* Módulos — ação principal */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7BA892' }}>Novo planejamento</p>
      <div className="space-y-3 mb-8">
        {MODULOS.map(m => (
          <Link key={m.href} href={m.href}
            className="flex items-center justify-between p-5 rounded-3xl"
            style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#E8F5EE', color: '#128C7E' }}>{m.badge}</span>
              </div>
              <p className="font-semibold text-base" style={{ color: '#1A2E25' }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#5A7A68' }}>{m.desc}</p>
            </div>
            <span className="text-lg" style={{ color: '#C8E4D4' }}>→</span>
          </Link>
        ))}
      </div>

      {/* Histórico — claramente separado */}
      {total > 0 && (
        <div>
          <button
            onClick={() => setAberto(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl"
            style={{ background: aberto ? '#E8F5EE' : '#fff', border: '1.5px solid #D4EDE0' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ background: aberto ? '#128C7E' : '#F0F7F2' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h8M2 12h5" stroke={aberto ? '#fff' : '#7BA892'} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: '#1A2E25' }}>Meus planejamentos</p>
                <p className="text-xs" style={{ color: '#7BA892' }}>{total} salvo{total !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <span className="text-sm font-medium transition-transform"
              style={{ color: '#128C7E', transform: aberto ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>→</span>
          </button>

          {aberto && (
            <div className="mt-3 rounded-3xl overflow-hidden" style={{ border: '1.5px solid #D4EDE0', background: '#fff' }}>

              {estadias.length > 0 && (
                <>
                  <div className="px-5 py-2.5" style={{ background: '#F5FAF7', borderBottom: '1px solid #E4F2EA' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7BA892' }}>Casas de Aluguel</p>
                  </div>
                  {estadias.map((e, i) => {
                    const total = e.homens + e.mulheres + e.criancas
                    const partes = [e.homens > 0 ? `${e.homens}H` : '', e.mulheres > 0 ? `${e.mulheres}M` : '', e.criancas > 0 ? `${e.criancas}C` : ''].filter(Boolean).join(' ')
                    return (
                      <Link key={e.id} href={`/estadia/${e.id}`}
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{ borderBottom: i < estadias.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1A2E25' }}>{e.nome}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#7BA892' }}>{total} hóspedes · {partes} · {e.numeroDias} dias</p>
                        </div>
                        <span className="text-xs" style={{ color: '#C8E4D4' }}>→</span>
                      </Link>
                    )
                  })}
                </>
              )}

              {eventos.length > 0 && (
                <>
                  <div className="px-5 py-2.5" style={{ background: '#F5FAF7', borderBottom: '1px solid #E4F2EA', borderTop: estadias.length > 0 ? '1px solid #E4F2EA' : 'none' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7BA892' }}>Eventos</p>
                  </div>
                  {eventos.map((e, i) => (
                    <Link key={e.id} href={`/receita/${e.id}`}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: i < eventos.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A2E25' }}>{e.nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#7BA892' }}>
                          {e.tipoEvento ? TIPO_LABELS[e.tipoEvento] || e.tipoEvento : 'Evento'} · {e.totalPessoas} pessoas
                          {e.data && ` · ${new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                        </p>
                      </div>
                      <span className="text-xs" style={{ color: '#C8E4D4' }}>→</span>
                    </Link>
                  ))}
                </>
              )}

              {pousadas.length > 0 && (
                <>
                  <div className="px-5 py-2.5" style={{ background: '#F5FAF7', borderBottom: '1px solid #E4F2EA', borderTop: (estadias.length > 0 || eventos.length > 0) ? '1px solid #E4F2EA' : 'none' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7BA892' }}>Pousadas</p>
                  </div>
                  {pousadas.map((p, i) => (
                    <Link key={p.id} href={`/pousada/${p.id}`}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: i < pousadas.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A2E25' }}>{p.nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#7BA892' }}>{p.totalQuartos} quarto{p.totalQuartos !== 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-xs" style={{ color: '#C8E4D4' }}>→</span>
                    </Link>
                  ))}
                </>
              )}

            </div>
          )}
        </div>
      )}

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-semibold mb-1" style={{ color: '#1A2E25' }}>Nenhum planejamento ainda</p>
          <p className="text-sm" style={{ color: '#5A7A68' }}>Escolha um módulo acima para começar</p>
        </div>
      )}

    </main>
  )
}
