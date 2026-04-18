'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Estadia {
  id: string
  nome: string
  homens: number
  mulheres: number
  criancas: number
  numeroDias: number
}

interface Evento {
  id: string
  nome: string
  data?: string
  homens: number
  mulheres: number
  criancas: number
  totalPessoas: number
}

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])

  useEffect(() => {
    setEstadias(JSON.parse(localStorage.getItem('estadias') || '[]'))
    setEventos(JSON.parse(localStorage.getItem('eventos') || '[]'))
  }, [])

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>

      <header className="mb-8">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#1A2E25' }}>Despensa</span>
      </header>

      {/* Ferramentas */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/estadia/nova"
          className="p-4 rounded-3xl flex flex-col gap-2"
          style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
          <span className="text-2xl">🏠</span>
          <p className="font-semibold text-sm" style={{ color: '#1A2E25' }}>Planejar estadia</p>
          <p className="text-xs leading-snug" style={{ color: '#5A7A68' }}>Cardápio por dia + lista de compras</p>
        </Link>
        <Link href="/receita/nova"
          className="p-4 rounded-3xl flex flex-col gap-2"
          style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
          <span className="text-2xl">🍽️</span>
          <p className="font-semibold text-sm" style={{ color: '#1A2E25' }}>Planejar receita</p>
          <p className="text-xs leading-snug" style={{ color: '#5A7A68' }}>Monte o cardápio de um evento</p>
        </Link>
      </div>

      {/* Estadias recentes */}
      {estadias.length > 0 && (
        <>
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1A2E25' }}>Estadias recentes</h2>
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

      {/* Receitas recentes */}
      {eventos.length > 0 && (
        <>
          <h2 className="text-base font-semibold mb-3" style={{ color: '#1A2E25' }}>Receitas recentes</h2>
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

      {estadias.length === 0 && eventos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-semibold mb-1" style={{ color: '#1A2E25' }}>Nenhum planejamento ainda</p>
          <p className="text-sm mb-6" style={{ color: '#5A7A68' }}>Crie uma estadia ou planeje uma receita para começar</p>
        </div>
      )}
    </main>
  )
}
