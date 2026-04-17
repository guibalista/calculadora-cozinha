'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { tabelaAlimentos } from '@/lib/fatores-correcao'
import { totalEquivalente, somarHospedes } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'

interface Ingrediente { nome: string; qtdPorEquiv: number; fc: number; fcc: number; categoria: string }
interface Prato { id: string; nome: string; ingredientes: Ingrediente[] }
interface Dia { indice: number; label: string; pratos: Prato[]; extrasHomens: number; extrasMulheres: number; extrasCriancas: number }
interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numeroDias: number; dias: Dia[] }

export default function EstadiaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [estadia, setEstadia] = useState<Estadia | null>(null)
  const [diaAtivo, setDiaAtivo] = useState(0)
  const [adicionandoPrato, setAdicionandoPrato] = useState(false)
  const [nomePrato, setNomePrato] = useState('')
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [nomeIng, setNomeIng] = useState('')
  const [qtdIng, setQtdIng] = useState('')
  const [fcIng, setFcIng] = useState('1.00')

  useEffect(() => {
    const estadias = JSON.parse(localStorage.getItem('estadias') || '[]')
    const found = estadias.find((e: Estadia) => e.id === id)
    if (found) setEstadia(found)
  }, [id])

  function salvar(nova: Estadia) {
    const estadias = JSON.parse(localStorage.getItem('estadias') || '[]')
    const idx = estadias.findIndex((e: Estadia) => e.id === id)
    if (idx >= 0) { estadias[idx] = nova; localStorage.setItem('estadias', JSON.stringify(estadias)) }
    setEstadia(nova)
  }

  function buscarFatores(nome: string) {
    const base = tabelaAlimentos.find(a => a.nome.toLowerCase().includes(nome.toLowerCase()))
    if (base) setFcIng(base.fatorCorrecao.toFixed(2))
  }

  function adicionarIngrediente() {
    if (!nomeIng || !qtdIng) return
    const base = tabelaAlimentos.find(a => a.nome.toLowerCase().includes(nomeIng.toLowerCase()))
    setIngredientes(prev => [...prev, {
      nome: nomeIng, qtdPorEquiv: parseFloat(qtdIng),
      fc: parseFloat(fcIng), fcc: base?.fatorCoccao ?? 0.80,
      categoria: base?.categoria ?? 'proteina'
    }])
    setNomeIng(''); setQtdIng(''); setFcIng('1.00')
  }

  function salvarPrato() {
    if (!nomePrato || ingredientes.length === 0 || !estadia) return
    const novo: Prato = { id: Date.now().toString(), nome: nomePrato, ingredientes }
    const nova = { ...estadia, dias: estadia.dias.map((d, i) => i === diaAtivo ? { ...d, pratos: [...d.pratos, novo] } : d) }
    salvar(nova)
    setAdicionandoPrato(false); setNomePrato(''); setIngredientes([])
  }

  function removerPrato(pratoId: string) {
    if (!estadia) return
    const nova = { ...estadia, dias: estadia.dias.map((d, i) => i === diaAtivo ? { ...d, pratos: d.pratos.filter(p => p.id !== pratoId) } : d) }
    salvar(nova)
  }

  function atualizarExtras(campo: 'extrasHomens' | 'extrasMulheres' | 'extrasCriancas', val: number) {
    if (!estadia) return
    const nova = { ...estadia, dias: estadia.dias.map((d, i) => i === diaAtivo ? { ...d, [campo]: Math.max(0, val) } : d) }
    salvar(nova)
  }

  if (!estadia) return <div className="flex items-center justify-center min-h-screen"><p style={{ color: '#717171' }}>Carregando...</p></div>

  const dia = estadia.dias[diaAtivo]
  const hospedesTotais = somarHospedes(
    { homens: estadia.homens, mulheres: estadia.mulheres, criancas: estadia.criancas },
    { homens: dia.extrasHomens, mulheres: dia.extrasMulheres, criancas: dia.extrasCriancas }
  )
  const equiv = totalEquivalente(hospedesTotais)
  const totalPessoas = hospedesTotais.homens + hospedesTotais.mulheres + hospedesTotais.criancas

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#F7F5F2' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#222' }}>← Estadias</Link>
          <Link href={`/estadia/${id}/lista`}
            className="px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#222', color: '#fff' }}>
            Ver lista 🛒
          </Link>
        </div>
        <h1 className="text-xl font-bold mb-0.5" style={{ color: '#222' }}>{estadia.nome}</h1>
        <p className="text-sm" style={{ color: '#717171' }}>
          {estadia.homens + estadia.mulheres + estadia.criancas} hóspedes · {estadia.numeroDias} dias
        </p>
      </div>

      {/* Seletor de dias */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto">
        {estadia.dias.map((d, i) => (
          <button key={i} onClick={() => setDiaAtivo(i)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all"
            style={diaAtivo === i
              ? { background: '#222', color: '#fff' }
              : { background: '#fff', color: '#717171', border: '1.5px solid #EBEBEB' }}>
            {d.label}
            {d.pratos.length > 0 && <span className="ml-1.5 text-xs opacity-60">{d.pratos.length}</span>}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-4">
        {/* Convidados extras */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #EBEBEB' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: '#222' }}>Convidados extras neste dia</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { label: 'Homens', campo: 'extrasHomens' as const, val: dia.extrasHomens },
              { label: 'Mulheres', campo: 'extrasMulheres' as const, val: dia.extrasMulheres },
              { label: 'Crianças', campo: 'extrasCriancas' as const, val: dia.extrasCriancas },
            ]).map(({ label, campo, val }) => (
              <div key={campo} className="text-center">
                <p className="text-xs mb-2" style={{ color: '#717171' }}>{label}</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => atualizarExtras(campo, val - 1)}
                    className="w-7 h-7 rounded-full text-sm font-medium"
                    style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}>−</button>
                  <span className="font-semibold w-4 text-center" style={{ color: '#222' }}>{val}</span>
                  <button onClick={() => atualizarExtras(campo, val + 1)}
                    className="w-7 h-7 rounded-full text-sm font-medium"
                    style={{ border: '1.5px solid #222', color: '#fff', background: '#222' }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 pt-3" style={{ color: '#9B8B7A', borderTop: '1px solid #EBEBEB' }}>
            Total do dia: {totalPessoas} pessoas · {equiv.toFixed(1)} porções equivalentes
          </p>
        </div>

        {/* Pratos do dia */}
        <div>
          <p className="font-semibold text-base mb-3" style={{ color: '#222' }}>Pratos do dia</p>
          {dia.pratos.length === 0 && !adicionandoPrato && (
            <div className="bg-white rounded-3xl p-6 text-center" style={{ border: '1.5px dashed #DDDDDD' }}>
              <p className="text-sm mb-1" style={{ color: '#717171' }}>Nenhum prato adicionado</p>
            </div>
          )}
          {dia.pratos.map(prato => (
            <div key={prato.id} className="bg-white rounded-3xl p-5 mb-3" style={{ border: '1.5px solid #EBEBEB' }}>
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold" style={{ color: '#222' }}>{prato.nome}</p>
                <button onClick={() => removerPrato(prato.id)} className="text-sm" style={{ color: '#BBBBBB' }}>×</button>
              </div>
              <div className="space-y-1.5">
                {prato.ingredientes.map((ing, i) => {
                  const liquido = ing.qtdPorEquiv * equiv
                  const bruto = liquido * ing.fc
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: '#717171' }}>{ing.nome}</span>
                      <span className="font-medium" style={{ color: '#222' }}>
                        {formatarPeso(bruto)} bruto · {formatarPeso(liquido)} líq.
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Formulário de novo prato */}
          {adicionandoPrato ? (
            <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #222' }}>
              <p className="font-semibold mb-4" style={{ color: '#222' }}>Novo prato</p>
              <input
                type="text" value={nomePrato} onChange={e => setNomePrato(e.target.value)}
                placeholder="Nome do prato (ex: Frango grelhado)"
                className="w-full px-4 py-3 rounded-2xl border text-sm outline-none mb-4"
                style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2' }}
              />

              <p className="text-sm font-medium mb-2" style={{ color: '#222' }}>Ingredientes</p>
              {ingredientes.map((ing, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1.5" style={{ borderBottom: '1px solid #EBEBEB' }}>
                  <span style={{ color: '#717171' }}>{ing.nome}</span>
                  <span style={{ color: '#222' }}>{formatarPeso(ing.qtdPorEquiv * equiv)} líq.</span>
                </div>
              ))}

              <div className="mt-3 space-y-2">
                <input
                  type="text" value={nomeIng}
                  onChange={e => { setNomeIng(e.target.value); buscarFatores(e.target.value) }}
                  placeholder="Nome do ingrediente"
                  list="lista-alimentos"
                  className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                  style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2' }}
                />
                <datalist id="lista-alimentos">
                  {tabelaAlimentos.map(a => <option key={a.nome} value={a.nome} />)}
                </datalist>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#717171' }}>kg por porção equiv.</p>
                    <input type="number" value={qtdIng} onChange={e => setQtdIng(e.target.value)}
                      placeholder="0.250" step="0.01" min="0"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#717171' }}>Fator de correção</p>
                    <input type="number" value={fcIng} onChange={e => setFcIng(e.target.value)}
                      step="0.01" min="1"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2' }} />
                  </div>
                </div>
                <button onClick={adicionarIngrediente} disabled={!nomeIng || !qtdIng}
                  className="w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
                  style={{ background: '#F7F5F2', color: '#222', border: '1.5px solid #DDDDDD' }}>
                  + Adicionar ingrediente
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => { setAdicionandoPrato(false); setNomePrato(''); setIngredientes([]) }}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium"
                  style={{ border: '1.5px solid #DDDDDD', color: '#717171', background: '#fff' }}>
                  Cancelar
                </button>
                <button onClick={salvarPrato} disabled={!nomePrato || ingredientes.length === 0}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: '#222', color: '#fff' }}>
                  Salvar prato
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdicionandoPrato(true)}
              className="w-full py-4 rounded-3xl text-sm font-semibold mt-2"
              style={{ border: '1.5px dashed #DDDDDD', color: '#222', background: '#fff' }}>
              + Adicionar prato
            </button>
          )}
        </div>
        <div className="h-8" />
      </div>
    </main>
  )
}
