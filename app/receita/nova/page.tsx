'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function Contador({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #EBEBEB' }}>
      <p className="font-medium text-base" style={{ color: '#222' }}>{label}</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium"
          style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}>−</button>
        <span className="w-5 text-center font-semibold text-lg" style={{ color: '#222' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium"
          style={{ border: '1.5px solid #222', color: '#fff', background: '#222' }}>+</button>
      </div>
    </div>
  )
}

export default function NovaReceitaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  const [homens, setHomens] = useState(0)
  const [mulheres, setMulheres] = useState(0)
  const [criancas, setCriancas] = useState(0)

  const total = homens + mulheres + criancas
  const podeCriar = nome && total > 0

  function criar() {
    if (!podeCriar) return
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const novo = {
      id: Date.now().toString(),
      nome, data, homens, mulheres, criancas, totalPessoas: total,
      refeicoes: [],
    }
    eventos.push(novo)
    localStorage.setItem('eventos', JSON.stringify(eventos))
    router.push(`/receita/${novo.id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F7F5F2' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#222' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Planejar receita</h1>
      <p className="text-sm mb-8" style={{ color: '#717171' }}>Monte o cardápio de um evento ou refeição</p>

      {/* Nome */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #EBEBEB' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: '#222' }}>Nome do evento</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Ex: Churrasco de sábado, Almoço de domingo"
          className="w-full px-4 py-3 rounded-2xl border text-base outline-none"
          style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }} />
      </div>

      {/* Data (opcional) */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #EBEBEB' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: '#222' }}>
          Data do evento <span style={{ color: '#BBBBBB' }}>(opcional)</span>
        </label>
        <input type="date" value={data} onChange={e => setData(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }} />
      </div>

      {/* Pessoas */}
      <div className="bg-white rounded-3xl px-5 mb-6" style={{ border: '1.5px solid #EBEBEB' }}>
        <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#222' }}>Número de pessoas</p>
        <p className="text-sm pb-2" style={{ color: '#717171' }}>Informe para calcular as quantidades</p>
        <Contador label="Homens" value={homens} onChange={setHomens} />
        <Contador label="Mulheres" value={mulheres} onChange={setMulheres} />
        <Contador label="Crianças" value={criancas} onChange={setCriancas} />
        {total > 0 && (
          <p className="text-sm py-4 font-medium" style={{ color: '#9B8B7A' }}>
            {total} pessoa{total > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#222', color: '#fff' }}>
        Montar cardápio
      </button>
    </main>
  )
}
