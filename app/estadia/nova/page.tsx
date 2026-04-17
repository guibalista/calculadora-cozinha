'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function ContadorPessoas({ label, sublabel, value, onChange }: {
  label: string, sublabel: string, value: number, onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #EBEBEB' }}>
      <div>
        <p className="font-medium text-base" style={{ color: '#222' }}>{label}</p>
        <p className="text-sm" style={{ color: '#717171' }}>{sublabel}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full border flex items-center justify-center text-lg font-medium transition-colors active:opacity-60"
          style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}
        >−</button>
        <span className="w-5 text-center font-semibold text-lg" style={{ color: '#222' }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border flex items-center justify-center text-lg font-medium transition-colors active:opacity-60"
          style={{ border: '1.5px solid #222', color: '#fff', background: '#222' }}
        >+</button>
      </div>
    </div>
  )
}

export default function NovaEstadiaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [numeroDias, setNumeroDias] = useState(7)
  const [homens, setHomens] = useState(0)
  const [mulheres, setMulheres] = useState(0)
  const [criancas, setCriancas] = useState(0)

  const totalPessoas = homens + mulheres + criancas

  function criar() {
    if (!nome || totalPessoas === 0) return
    // Salvar no localStorage por enquanto
    const estadias = JSON.parse(localStorage.getItem('estadias') || '[]')
    const nova = {
      id: Date.now().toString(),
      nome, homens, mulheres, criancas, numeroDias,
      dias: Array.from({ length: numeroDias }, (_, i) => ({
        indice: i,
        label: `Dia ${i + 1}`,
        pratos: [],
        extrasHomens: 0, extrasMulheres: 0, extrasCriancas: 0,
      }))
    }
    estadias.push(nova)
    localStorage.setItem('estadias', JSON.stringify(estadias))
    router.push(`/estadia/${nova.id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F7F5F2' }}>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#222' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Nova estadia</h1>
      <p className="text-sm mb-8" style={{ color: '#717171' }}>Defina os hóspedes e duração</p>

      {/* Nome */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #EBEBEB' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: '#222' }}>Nome da estadia</label>
        <input
          type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Ex: Família Silva, Grupo de Amigos"
          className="w-full px-4 py-3 rounded-2xl border text-base outline-none"
          style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }}
        />
      </div>

      {/* Duração */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #EBEBEB' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-base" style={{ color: '#222' }}>Número de dias</p>
            <p className="text-sm" style={{ color: '#717171' }}>Duração da estadia</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setNumeroDias(Math.max(1, numeroDias - 1))}
              className="w-9 h-9 rounded-full border flex items-center justify-center text-lg font-medium active:opacity-60"
              style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}
            >−</button>
            <span className="w-5 text-center font-semibold text-lg" style={{ color: '#222' }}>{numeroDias}</span>
            <button
              type="button"
              onClick={() => setNumeroDias(numeroDias + 1)}
              className="w-9 h-9 rounded-full border flex items-center justify-center text-lg font-medium active:opacity-60"
              style={{ border: '1.5px solid #222', color: '#fff', background: '#222' }}
            >+</button>
          </div>
        </div>
      </div>

      {/* Hóspedes */}
      <div className="bg-white rounded-3xl px-5 mb-6" style={{ border: '1.5px solid #EBEBEB' }}>
        <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#222' }}>Hóspedes fixos</p>
        <p className="text-sm pb-2" style={{ color: '#717171' }}>Quem fica durante toda a estadia</p>
        <ContadorPessoas label="Homens" sublabel="Porção completa" value={homens} onChange={setHomens} />
        <ContadorPessoas label="Mulheres" sublabel="80% da porção" value={mulheres} onChange={setMulheres} />
        <ContadorPessoas label="Crianças" sublabel="50% da porção" value={criancas} onChange={setCriancas} />
        {totalPessoas > 0 && (
          <p className="text-sm py-4 font-medium" style={{ color: '#9B8B7A' }}>
            {totalPessoas} pessoa{totalPessoas > 1 ? 's' : ''} · equivalente a {(homens * 1 + mulheres * 0.8 + criancas * 0.5).toFixed(1)} porções
          </p>
        )}
      </div>

      <button
        onClick={criar}
        disabled={!nome || totalPessoas === 0}
        className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40 transition-opacity"
        style={{ background: '#222', color: '#fff' }}
      >
        Criar estadia e planejar
      </button>
    </main>
  )
}
