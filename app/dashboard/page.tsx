'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Estadia {
  id: string; nome: string
  homens: number; mulheres: number; criancas: number
  numeroDias: number; dataInicio?: string; dataFim?: string
}

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataHoje(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function periodo(e: Estadia): string {
  if (e.dataInicio && e.dataFim) {
    const ini = new Date(e.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const fim = new Date(e.dataFim + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    return `${ini} – ${fim}`
  }
  return `${e.numeroDias} dia${e.numeroDias !== 1 ? 's' : ''}`
}

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])

  useEffect(() => {
    setEstadias(JSON.parse(localStorage.getItem('estadias') || '[]'))
  }, [])

  const total = estadias.length

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-5 py-8" style={{ background: '#F0F7F2' }}>

      {/* Header compacto com CTA inline */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium mb-0.5 capitalize" style={{ color: '#7BA892' }}>{dataHoje()}</p>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: '#1A2E25' }}>{saudacao()}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A7A68' }}>
            {total === 0 ? 'Nenhum planejamento ainda' : `${total} planejamento${total !== 1 ? 's' : ''} salvo${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/estadia/nova"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm flex-shrink-0"
          style={{ background: '#128C7E', color: '#fff' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Novo
        </Link>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl mb-5 flex items-center justify-center" style={{ background: '#E8F5EE' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#128C7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="#128C7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>Pronto para planejar</p>
          <p className="text-sm mb-6" style={{ color: '#5A7A68' }}>Crie seu primeiro planejamento</p>
          <Link href="/estadia/nova"
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#128C7E', color: '#fff' }}>
            Criar planejamento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {estadias.map((e) => {
            const totalP = e.homens + e.mulheres + e.criancas
            const partes = [
              e.homens > 0 ? `${e.homens}H` : '',
              e.mulheres > 0 ? `${e.mulheres}M` : '',
              e.criancas > 0 ? `${e.criancas}C` : '',
            ].filter(Boolean).join(' ')

            return (
              <Link key={e.id} href={`/estadia/${e.id}`}
                className="flex flex-col justify-between p-4 rounded-3xl"
                style={{ background: '#fff', border: '1.5px solid #D4EDE0', minHeight: 120 }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="font-semibold text-sm leading-tight" style={{ color: '#1A2E25' }}>{e.nome}</p>
                  <span style={{ color: '#C8E4D4', fontSize: 16, flexShrink: 0 }}>→</span>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#128C7E' }}>{periodo(e)}</p>
                  <p className="text-xs" style={{ color: '#7BA892' }}>
                    {totalP} hóspede{totalP !== 1 ? 's' : ''}
                    {partes ? ` · ${partes}` : ''}
                  </p>
                </div>
              </Link>
            )
          })}

          {/* Card de novo planejamento no grid */}
          <Link href="/estadia/nova"
            className="flex flex-col items-center justify-center p-4 rounded-3xl"
            style={{ border: '1.5px dashed #C8E4D4', background: 'transparent', minHeight: 120 }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
              style={{ background: '#E8F5EE' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#128C7E" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-xs font-semibold text-center" style={{ color: '#128C7E' }}>Novo planejamento</p>
          </Link>
        </div>
      )}

    </main>
  )
}
