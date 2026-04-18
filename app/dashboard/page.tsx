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

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])

  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem('estadias') || '[]')
    setEstadias(salvas)
  }, [])

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F7F5F2' }}>

      <header className="flex items-center justify-between mb-8">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#222' }}>despensa</span>
        <Link href="/estadia/nova"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: '#222', color: '#fff' }}>
          + Nova estadia
        </Link>
      </header>

      {/* Ferramentas */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/estadia/nova"
          className="p-4 rounded-3xl flex flex-col gap-2"
          style={{ background: '#fff', border: '1.5px solid #EBEBEB' }}>
          <span className="text-2xl">🏠</span>
          <p className="font-semibold text-sm" style={{ color: '#222' }}>Planejar estadia</p>
          <p className="text-xs leading-snug" style={{ color: '#717171' }}>Cardápio por dia + lista de compras</p>
        </Link>
        <Link href="/calculadora"
          className="p-4 rounded-3xl flex flex-col gap-2"
          style={{ background: '#fff', border: '1.5px solid #EBEBEB' }}>
          <span className="text-2xl">🧮</span>
          <p className="font-semibold text-sm" style={{ color: '#222' }}>Calculadora</p>
          <p className="text-xs leading-snug" style={{ color: '#717171' }}>Custo de receita e preço de venda</p>
        </Link>
      </div>

      {/* Estadias */}
      <h2 className="text-base font-semibold mb-3" style={{ color: '#222' }}>Estadias recentes</h2>

      {estadias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-semibold mb-1" style={{ color: '#222' }}>Nenhuma estadia ainda</p>
          <p className="text-sm mb-6" style={{ color: '#717171' }}>Crie a primeira para começar a planejar</p>
          <Link href="/estadia/nova"
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#222', color: '#fff' }}>
            Criar estadia
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {estadias.map(e => {
            const total = e.homens + e.mulheres + e.criancas
            return (
              <Link key={e.id} href={`/estadia/${e.id}`}
                className="flex items-center justify-between p-5 rounded-3xl bg-white active:opacity-70"
                style={{ border: '1.5px solid #EBEBEB' }}>
                <div>
                  <p className="font-semibold text-base mb-1" style={{ color: '#222' }}>{e.nome}</p>
                  <p className="text-sm" style={{ color: '#717171' }}>
                    {total} hóspede{total !== 1 ? 's' : ''}
                    {e.homens > 0 && ` · ${e.homens}H`}
                    {e.mulheres > 0 && ` ${e.mulheres}M`}
                    {e.criancas > 0 && ` ${e.criancas}C`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: '#9B8B7A' }}>{e.numeroDias} dia{e.numeroDias !== 1 ? 's' : ''}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#BBBBBB' }}>→</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
