'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ border: '1.5px solid #3A2E22', color: '#F2EBE0', background: '#252015' }}>−</button>
        <span className="w-6 text-center font-semibold text-lg" style={{ color: '#F2EBE0' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: '#C4823A', color: '#fff' }}>+</button>
      </div>
    </div>
  )
}

const REFEICOES_OPT = [
  { key: 'cafe_manha', label: 'Café da manhã' },
  { key: 'almoco', label: 'Almoço' },
  { key: 'jantar', label: 'Jantar' },
]

export default function NovaPousadaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [totalQuartos, setTotalQuartos] = useState(5)
  const [homens, setHomens] = useState(0)
  const [mulheres, setMulheres] = useState(0)
  const [criancas, setCriancas] = useState(0)
  const [refeicoes, setRefeicoes] = useState<string[]>(['cafe_manha'])
  const [diariaTipo, setDiariaTipo] = useState<'por_quarto' | 'por_pessoa'>('por_quarto')
  const [valorDiaria, setValorDiaria] = useState('')

  const totalHospedes = homens + mulheres + criancas
  const podeCriar = nome.trim() && totalHospedes > 0 && refeicoes.length > 0

  function toggleRefeicao(key: string) {
    setRefeicoes(r => r.includes(key) ? r.filter(x => x !== key) : [...r, key])
  }

  function criar() {
    if (!podeCriar) return
    const lista = JSON.parse(localStorage.getItem('pousadas') || '[]')
    const nova = {
      id: Date.now().toString(),
      nome: nome.trim(),
      totalQuartos,
      hospedes: { homens, mulheres, criancas },
      refeicoes,
      diariaTipo,
      valorDiaria: parseFloat(valorDiaria) || 0,
      cardapio: [],
      precos: [],
    }
    lista.push(nova)
    localStorage.setItem('pousadas', JSON.stringify(lista))
    router.push(`/pousada/${nova.id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#1C1712' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium" style={{ color: '#C4823A' }}>← Voltar</Link>
      </div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#F2EBE0' }}>Nova pousada</h1>
      <p className="text-sm mb-8" style={{ color: '#9B8B7A' }}>Configure seu estabelecimento</p>

      <div className="space-y-4">
        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#F2EBE0' }}>Nome da pousada</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Ex: Pousada do Sol, Chalés da Serra"
            className="w-full px-4 py-3 rounded-2xl text-base outline-none"
            style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
        </div>

        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-sm" style={{ color: '#F2EBE0' }}>Total de quartos</p>
            <span className="font-bold text-lg" style={{ color: '#C4823A' }}>{totalQuartos}</span>
          </div>
          <input type="range" min="1" max="50" value={totalQuartos}
            onChange={e => setTotalQuartos(parseInt(e.target.value))}
            className="w-full" style={{ accentColor: '#C4823A' }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#9B8B7A' }}>
            <span>1</span><span>25</span><span>50</span>
          </div>
        </div>

        <div className="rounded-3xl px-5 pb-2" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#F2EBE0' }}>Hóspedes típicos por noite</p>
          <p className="text-sm pb-2" style={{ color: '#9B8B7A' }}>Média de ocupação base para o cardápio</p>
          <ContadorPessoas label="Homens" sublabel="Porção completa" value={homens} onChange={setHomens} />
          <ContadorPessoas label="Mulheres" sublabel="Porção reduzida" value={mulheres} onChange={setMulheres} />
          <ContadorPessoas label="Crianças" sublabel="Meia porção" value={criancas} onChange={setCriancas} />
          {totalHospedes > 0 && (
            <p className="text-sm py-4 font-medium" style={{ color: '#9B8B7A' }}>
              {totalHospedes} hóspede{totalHospedes > 1 ? 's' : ''} por noite (base)
            </p>
          )}
        </div>

        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#F2EBE0' }}>Refeições incluídas na diária</p>
          <div className="flex gap-2 flex-wrap">
            {REFEICOES_OPT.map(r => (
              <button key={r.key} onClick={() => toggleRefeicao(r.key)}
                className="px-4 py-2 rounded-2xl text-sm font-medium"
                style={refeicoes.includes(r.key)
                  ? { background: '#C4823A', color: '#fff' }
                  : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#F2EBE0' }}>Valor da diária (para CMV)</p>
          <div className="flex gap-2 mb-3">
            {[{ key: 'por_quarto', label: 'Por quarto' }, { key: 'por_pessoa', label: 'Por pessoa' }].map(t => (
              <button key={t.key} onClick={() => setDiariaTipo(t.key as 'por_quarto' | 'por_pessoa')}
                className="flex-1 py-2.5 rounded-2xl text-sm font-medium"
                style={diariaTipo === t.key
                  ? { background: '#C4823A', color: '#fff' }
                  : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#9B8B7A' }}>R$</span>
            <input type="number" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)}
              placeholder="0,00" step="10" min="0"
              className="flex-1 px-4 py-3 rounded-2xl text-base outline-none"
              style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
          </div>
        </div>
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full mt-6 py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#C4823A', color: '#fff' }}>
        Criar pousada e montar cardápio
      </button>
    </main>
  )
}
