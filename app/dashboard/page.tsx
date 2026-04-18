'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numeroDias: number }
interface Evento { id: string; nome: string; data?: string; homens: number; mulheres: number; criancas: number; totalPessoas: number }
interface Restaurante { id: string; nome: string; tipo: string; pratos: unknown[] }
interface Pousada { id: string; nome: string; totalQuartos: number }

const MODULOS = [
  { href: '/estadia/nova', label: 'Temporada', desc: 'Casa de aluguel e Airbnb', badge: 'Casas' },
  { href: '/pousada/nova', label: 'Pousada', desc: 'B&B, chalés e pousadas', badge: 'Pousadas' },
  { href: '/restaurante/novo', label: 'Restaurante', desc: 'Restaurantes, bares e bistrôs', badge: 'Restaurantes' },
  { href: '/receita/nova', label: 'Eventos', desc: 'Festas, formaturas e casamentos', badge: 'Eventos' },
]

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([])
  const [pousadas, setPousadas] = useState<Pousada[]>([])

  useEffect(() => {
    setEstadias(JSON.parse(localStorage.getItem('estadias') || '[]'))
    setEventos(JSON.parse(localStorage.getItem('eventos') || '[]'))
    setRestaurantes(JSON.parse(localStorage.getItem('restaurantes') || '[]'))
    setPousadas(JSON.parse(localStorage.getItem('pousadas') || '[]'))
  }, [])

  const temHistorico = estadias.length > 0 || eventos.length > 0 || restaurantes.length > 0 || pousadas.length > 0

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>

      <header className="mb-8">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#1A2E25' }}>Despensa</span>
        <p className="text-sm mt-0.5" style={{ color: '#7BA892' }}>Assertividade nas compras</p>
      </header>

      {/* Módulos */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {MODULOS.map(m => (
          <Link key={m.href} href={m.href}
            className="p-4 rounded-3xl flex flex-col gap-2"
            style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full self-start"
              style={{ background: '#E8F5EE', color: '#128C7E' }}>{m.badge}</span>
            <p className="font-semibold text-sm leading-tight" style={{ color: '#1A2E25' }}>{m.label}</p>
            <p className="text-xs leading-snug" style={{ color: '#5A7A68' }}>{m.desc}</p>
          </Link>
        ))}
      </div>

      {/* Histórico */}
      {!temHistorico && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-semibold mb-1" style={{ color: '#1A2E25' }}>Nenhum planejamento ainda</p>
          <p className="text-sm" style={{ color: '#5A7A68' }}>Escolha um módulo acima para começar</p>
        </div>
      )}

      {restaurantes.length > 0 && (
        <>
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1A2E25' }}>Restaurantes</h2>
          <div className="space-y-3 mb-6">
            {restaurantes.map(r => (
              <Link key={r.id} href={`/restaurante/${r.id}`}
                className="flex items-center justify-between p-5 rounded-3xl bg-white"
                style={{ border: '1.5px solid #D4EDE0' }}>
                <div>
                  <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>{r.nome}</p>
                  <p className="text-sm" style={{ color: '#5A7A68' }}>{r.tipo} · {r.pratos.length} prato{r.pratos.length !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-xs" style={{ color: '#7BA892' }}>→</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {pousadas.length > 0 && (
        <>
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1A2E25' }}>Pousadas</h2>
          <div className="space-y-3 mb-6">
            {pousadas.map(p => (
              <Link key={p.id} href={`/pousada/${p.id}`}
                className="flex items-center justify-between p-5 rounded-3xl bg-white"
                style={{ border: '1.5px solid #D4EDE0' }}>
                <div>
                  <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>{p.nome}</p>
                  <p className="text-sm" style={{ color: '#5A7A68' }}>{p.totalQuartos} quarto{p.totalQuartos !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-xs" style={{ color: '#7BA892' }}>→</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {estadias.length > 0 && (
        <>
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1A2E25' }}>Temporadas recentes</h2>
          <div className="space-y-3 mb-6">
            {estadias.map(e => {
              const total = e.homens + e.mulheres + e.criancas
              return (
                <Link key={e.id} href={`/estadia/${e.id}`}
                  className="flex items-center justify-between p-5 rounded-3xl bg-white"
                  style={{ border: '1.5px solid #D4EDE0' }}>
                  <div>
                    <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>{e.nome}</p>
                    <p className="text-sm" style={{ color: '#5A7A68' }}>
                      {total} hóspede{total !== 1 ? 's' : ''}
                      {e.homens > 0 && ` · ${e.homens}H`}
                      {e.mulheres > 0 && ` ${e.mulheres}M`}
                      {e.criancas > 0 && ` ${e.criancas}C`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#7BA892' }}>{e.numeroDias} dia{e.numeroDias !== 1 ? 's' : ''}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#7BA892' }}>→</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {eventos.length > 0 && (
        <>
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1A2E25' }}>Eventos recentes</h2>
          <div className="space-y-3 mb-6">
            {eventos.map(e => (
              <Link key={e.id} href={`/receita/${e.id}`}
                className="flex items-center justify-between p-5 rounded-3xl bg-white"
                style={{ border: '1.5px solid #D4EDE0' }}>
                <div>
                  <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>{e.nome}</p>
                  <p className="text-sm" style={{ color: '#5A7A68' }}>
                    {e.totalPessoas} pessoa{e.totalPessoas !== 1 ? 's' : ''}
                    {e.data && ` · ${new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                  </p>
                </div>
                <p className="text-xs" style={{ color: '#7BA892' }}>→</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
