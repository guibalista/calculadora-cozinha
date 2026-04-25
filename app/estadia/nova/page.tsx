'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function gerarDias(dataInicio: string, dataFim: string) {
  const inicio = new Date(dataInicio + 'T12:00:00')
  const fim = new Date(dataFim + 'T12:00:00')
  const dias = []
  const atual = new Date(inicio)
  while (atual <= fim) {
    const diaSemana = DIAS_SEMANA[atual.getDay()]
    const dia = atual.getDate().toString().padStart(2, '0')
    const mes = (atual.getMonth() + 1).toString().padStart(2, '0')
    dias.push({
      indice: dias.length,
      label: `${diaSemana} ${dia}/${mes}`,
      data: atual.toISOString().split('T')[0],
      pratos: [],
      extrasHomens: 0, extrasMulheres: 0, extrasCriancas: 0,
    })
    atual.setDate(atual.getDate() + 1)
  }
  return dias
}

function ContadorPessoas({ label, sublabel, value, onChange }: {
  label: string; sublabel: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #E4F2EA' }}>
      <div>
        <p className="font-medium text-base" style={{ color: '#1A2E25' }}>{label}</p>
        <p className="text-sm" style={{ color: '#5A7A68' }}>{sublabel}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
          style={{ border: '1.5px solid #C8E4D4', color: '#1A2E25', background: '#fff' }}>−</button>
        <span className="w-6 text-center font-semibold text-lg" style={{ color: '#1A2E25' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
          style={{ background: '#128C7E', color: '#fff' }}>+</button>
      </div>
    </div>
  )
}

export default function NovaEstadiaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [homens, setHomens] = useState(0)
  const [mulheres, setMulheres] = useState(0)
  const [criancas, setCriancas] = useState(0)

  const totalPessoas = homens + mulheres + criancas
  const numeroDias = dataInicio && dataFim
    ? Math.max(0, Math.round((new Date(dataFim + 'T12:00:00').getTime() - new Date(dataInicio + 'T12:00:00').getTime()) / 86400000) + 1)
    : 0
  const podeCriar = nome && dataInicio && dataFim && numeroDias > 0 && totalPessoas > 0

  function criar() {
    if (!podeCriar) return
    const estadias = JSON.parse(localStorage.getItem('estadias') || '[]')
    const nova = {
      id: Date.now().toString(),
      nome, homens, mulheres, criancas,
      dataInicio, dataFim, numeroDias,
      dias: gerarDias(dataInicio, dataFim),
    }
    estadias.push(nova)
    localStorage.setItem('estadias', JSON.stringify(estadias))
    router.push(`/estadia/${nova.id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#128C7E' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A2E25' }}>Nova estadia</h1>
      <p className="text-sm mb-8" style={{ color: '#5A7A68' }}>Defina as datas e os hóspedes</p>

      {/* Nome */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #D4EDE0' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>Nome da estadia</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Ex: Família Silva, Grupo de Amigos"
          className="w-full px-4 py-3 rounded-2xl border text-base outline-none"
          style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
      </div>

      {/* Datas */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #D4EDE0' }}>
        <p className="font-medium text-base mb-4" style={{ color: '#1A2E25' }}>Período da estadia</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7BA892' }}>Check-in</label>
            <input type="date" value={dataInicio}
              onChange={e => { setDataInicio(e.target.value); if (dataFim && e.target.value > dataFim) setDataFim('') }}
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
              style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7BA892' }}>Check-out</label>
            <input type="date" value={dataFim} min={dataInicio}
              onChange={e => setDataFim(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
              style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
          </div>
        </div>
        {numeroDias > 0 && (
          <p className="text-sm mt-3 font-medium" style={{ color: '#7BA892' }}>
            {numeroDias} dia{numeroDias > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Hóspedes */}
      <div className="bg-white rounded-3xl px-5 mb-6" style={{ border: '1.5px solid #D4EDE0' }}>
        <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#1A2E25' }}>Hóspedes</p>
        <p className="text-sm pb-2" style={{ color: '#5A7A68' }}>Quem fica durante toda a estadia</p>
        <ContadorPessoas label="Homens" sublabel="Adulto" value={homens} onChange={setHomens} />
        <ContadorPessoas label="Mulheres" sublabel="Adulta" value={mulheres} onChange={setMulheres} />
        <ContadorPessoas label="Crianças" sublabel="Até 12 anos" value={criancas} onChange={setCriancas} />
        {totalPessoas > 0 && (
          <p className="text-sm py-4 font-medium" style={{ color: '#7BA892' }}>
            {totalPessoas} pessoa{totalPessoas > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#128C7E', color: '#fff' }}>
        Criar estadia e planejar
      </button>
    </main>
  )
}
