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

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])

  useEffect(() => {
    setEstadias(JSON.parse(localStorage.getItem('estadias') || '[]'))
  }, [])

  return (
    <main className="min-h-screen max-w-lg mx-auto flex flex-col" style={{ background: '#F0F7F2' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-xs font-medium mb-1 capitalize" style={{ color: '#7BA892' }}>{dataHoje()}</p>
        <h1 className="text-2xl font-bold" style={{ color: '#1A2E25' }}>{saudacao()}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5A7A68' }}>
          {estadias.length === 0
            ? 'Nenhum planejamento ainda'
            : `${estadias.length} planejamento${estadias.length !== 1 ? 's' : ''} salvo${estadias.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Lista de planejamentos */}
      <div className="flex-1 px-5">
        {estadias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl mb-5 flex items-center justify-center"
              style={{ background: '#E8F5EE' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#128C7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#128C7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>Pronto para planejar</p>
            <p className="text-sm" style={{ color: '#5A7A68' }}>Crie seu primeiro planejamento abaixo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {estadias.map((e) => {
              const total = e.homens + e.mulheres + e.criancas
              const partes = [
                e.homens > 0 ? `${e.homens}H` : '',
                e.mulheres > 0 ? `${e.mulheres}M` : '',
                e.criancas > 0 ? `${e.criancas}C` : '',
              ].filter(Boolean).join(' ')
              const periodo = e.dataInicio && e.dataFim
                ? `${new Date(e.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} – ${new Date(e.dataFim + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                : `${e.numeroDias} dia${e.numeroDias !== 1 ? 's' : ''}`

              return (
                <Link key={e.id} href={`/estadia/${e.id}`}
                  className="flex items-center justify-between p-5 rounded-3xl"
                  style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
                  <div className="min-w-0">
                    <p className="font-semibold text-base truncate" style={{ color: '#1A2E25' }}>{e.nome}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#5A7A68' }}>
                      {total} hóspede{total !== 1 ? 's' : ''}
                      {partes ? ` · ${partes}` : ''}
                      {' · '}{periodo}
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0" style={{ color: '#C8E4D4', fontSize: 18 }}>→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA fixo no rodapé */}
      <div className="px-5 py-6">
        <Link href="/estadia/nova"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-3xl font-semibold text-base"
          style={{ background: '#128C7E', color: '#fff' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Novo planejamento
        </Link>
      </div>

    </main>
  )
}
