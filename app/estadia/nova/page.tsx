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
  label: string, sublabel: string, value: number, onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #EBEBEB' }}>
      <div>
        <p className="font-medium text-base" style={{ color: '#222' }}>{label}</p>
        <p className="text-sm" style={{ color: '#717171' }}>{sublabel}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium active:opacity-60"
          style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}>−</button>
        <span className="w-5 text-center font-semibold text-lg" style={{ color: '#222' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium active:opacity-60"
          style={{ border: '1.5px solid #222', color: '#fff', background: '#222' }}>+</button>
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
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F7F5F2' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#222' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Nova estadia</h1>
      <p className="text-sm mb-8" style={{ color: '#717171' }}>Defina datas e hóspedes</p>

      {/* Nome */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #EBEBEB' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: '#222' }}>Nome da estadia</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Ex: Família Silva, Grupo de Amigos"
          className="w-full px-4 py-3 rounded-2xl border text-base outline-none"
          style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }} />
      </div>

      {/* Datas */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #EBEBEB' }}>
        <p className="font-medium text-base mb-4" style={{ color: '#222' }}>Período da estadia</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#717171' }}>Check-in</label>
            <input type="date" value={dataInicio}
              onChange={e => { setDataInicio(e.target.value); if (dataFim && e.target.value > dataFim) setDataFim('') }}
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
              style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#717171' }}>Check-out</label>
            <input type="date" value={dataFim} min={dataInicio}
              onChange={e => setDataFim(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
              style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }} />
          </div>
        </div>
        {numeroDias > 0 && (
          <p className="text-sm mt-3 font-medium" style={{ color: '#9B8B7A' }}>
            {numeroDias} dia{numeroDias > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Hóspedes */}
      <div className="bg-white rounded-3xl px-5 mb-6" style={{ border: '1.5px solid #EBEBEB' }}>
        <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#222' }}>Hóspedes</p>
        <p className="text-sm pb-2" style={{ color: '#717171' }}>Quem fica durante toda a estadia</p>
        <ContadorPessoas label="Homens" sublabel="Porção completa" value={homens} onChange={setHomens} />
        <ContadorPessoas label="Mulheres" sublabel="Porção reduzida" value={mulheres} onChange={setMulheres} />
        <ContadorPessoas label="Crianças" sublabel="Meia porção" value={criancas} onChange={setCriancas} />
        {totalPessoas > 0 && (
          <p className="text-sm py-4 font-medium" style={{ color: '#9B8B7A' }}>
            {totalPessoas} pessoa{totalPessoas > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#222', color: '#fff' }}>
        Criar estadia e planejar
      </button>
    </main>
  )
}
