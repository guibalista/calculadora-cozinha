'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #3A2E22' }}>
      <div>
        <p className="font-medium text-base" style={{ color: '#F2EBE0' }}>{label}</p>
        <p className="text-sm" style={{ color: '#9B8B7A' }}>{sublabel}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
          style={{ border: '1.5px solid #3A2E22', color: '#F2EBE0', background: '#252015' }}>−</button>
        <span className="w-6 text-center font-semibold text-lg" style={{ color: '#F2EBE0' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
          style={{ background: '#C4823A', color: '#fff' }}>+</button>
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

  async function criar() {
    if (!podeCriar) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const id = Date.now().toString()
    const { error } = await supabase.from('estadias').insert({
      id,
      user_id: user.id,
      nome,
      homens,
      mulheres,
      criancas,
      numero_dias: numeroDias,
      data_inicio: dataInicio,
      data_fim: dataFim,
      dias: gerarDias(dataInicio, dataFim),
    })
    if (!error) router.push(`/estadia/${id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#1C1712' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#C4823A' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#F2EBE0' }}>Nova estadia</h1>
      <p className="text-sm mb-8" style={{ color: '#9B8B7A' }}>Defina as datas e os hóspedes</p>

      {/* Nome */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #3A2E22' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: '#F2EBE0' }}>Nome da estadia</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Ex: Família Silva, Grupo de Amigos"
          className="w-full px-4 py-3 rounded-2xl border text-base outline-none"
          style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
      </div>

      {/* Datas */}
      <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1.5px solid #3A2E22' }}>
        <p className="font-medium text-base mb-4" style={{ color: '#F2EBE0' }}>Período da estadia</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Check-in</label>
            <input type="date" value={dataInicio}
              onChange={e => { setDataInicio(e.target.value); if (dataFim && e.target.value > dataFim) setDataFim('') }}
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
              style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Check-out</label>
            <input type="date" value={dataFim} min={dataInicio}
              onChange={e => setDataFim(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
              style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
          </div>
        </div>
        {numeroDias > 0 && (
          <p className="text-sm mt-3 font-medium" style={{ color: '#9B8B7A' }}>
            {numeroDias} dia{numeroDias > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Hóspedes */}
      <div className="bg-white rounded-3xl px-5 mb-6" style={{ border: '1.5px solid #3A2E22' }}>
        <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#F2EBE0' }}>Hóspedes</p>
        <p className="text-sm pb-2" style={{ color: '#9B8B7A' }}>Quem fica durante toda a estadia</p>
        <ContadorPessoas label="Homens" sublabel="Adulto" value={homens} onChange={setHomens} />
        <ContadorPessoas label="Mulheres" sublabel="Adulta" value={mulheres} onChange={setMulheres} />
        <ContadorPessoas label="Crianças" sublabel="Até 12 anos" value={criancas} onChange={setCriancas} />
        {totalPessoas > 0 && (
          <p className="text-sm py-4 font-medium" style={{ color: '#9B8B7A' }}>
            {totalPessoas} pessoa{totalPessoas > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#C4823A', color: '#fff' }}>
        Criar estadia e planejar
      </button>
    </main>
  )
}
