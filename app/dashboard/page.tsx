'use client'
import { useState } from 'react'
import Link from 'next/link'

const MOCK_ESTADIAS = [
  { id: '1', nome: 'Família Silva', homens: 2, mulheres: 2, criancas: 1, dias: 5 },
  { id: '2', nome: 'Grupo de Amigos', homens: 4, mulheres: 3, criancas: 0, dias: 3 },
]

export default function DashboardPage() {
  const [estadias] = useState(MOCK_ESTADIAS)

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

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Estadias</h1>
      <p className="text-sm mb-6" style={{ color: '#717171' }}>Selecione uma estadia para planejar</p>

      {estadias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🏠</span>
          <p className="font-semibold mb-1" style={{ color: '#222' }}>Nenhuma estadia ainda</p>
          <p className="text-sm mb-6" style={{ color: '#717171' }}>Crie a primeira estadia para começar</p>
          <Link href="/estadia/nova"
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#222', color: '#fff' }}>
            Criar estadia
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {estadias.map(e => (
            <Link key={e.id} href={`/estadia/${e.id}`}
              className="flex items-center justify-between p-5 rounded-3xl border bg-white active:opacity-70 transition-opacity"
              style={{ border: '1.5px solid #EBEBEB' }}>
              <div>
                <p className="font-semibold text-base mb-1" style={{ color: '#222' }}>{e.nome}</p>
                <p className="text-sm" style={{ color: '#717171' }}>
                  {e.homens > 0 && `${e.homens} homem${e.homens > 1 ? 'ns' : ''}`}
                  {e.mulheres > 0 && ` · ${e.mulheres} mulher${e.mulheres > 1 ? 'es' : ''}`}
                  {e.criancas > 0 && ` · ${e.criancas} criança${e.criancas > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#9B8B7A' }}>{e.dias} dias</p>
                <p className="text-xs mt-0.5" style={{ color: '#BBBBBB' }}>→</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
