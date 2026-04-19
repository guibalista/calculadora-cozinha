'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, type Receita } from '@/lib/receitas-db'
import { totalEquivalente } from '@/lib/percapita'
import { calcularCMV, statusCMV, formatarMoeda, type PrecoIngrediente } from '@/lib/cmv'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; fcc: number; categoria: string }
interface Refeicao { id: string; nome: string; ingredientes: IngPrato[] }
interface Evento {
  id: string; nome: string; tipoEvento?: string; data?: string
  homens: number; mulheres: number; criancas: number; totalPessoas: number
  refeicoes: Refeicao[]
  precos: PrecoIngrediente[]
  precoVenda: number
}

type Aba = 'cardapio' | 'financeiro'

const TIPO_LABELS: Record<string, string> = {
  churrasco: 'Churrasco', casamento: 'Casamento', formatura: 'Formatura',
  aniversario: 'Aniversário', corporativo: 'Corporativo',
  almoco: 'Almoço', jantar: 'Jantar', brunch: 'Brunch', outro: 'Outro',
}

function fmtKg(kg: number): string {
  if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}mg`
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(2)}kg`
}

function InputIngrediente({ onAdicionar }: { onAdicionar: (ing: IngPrato) => void }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<Ingrediente[]>([])
  const [selecionado, setSelecionado] = useState<Ingrediente | null>(null)
  const [gramas, setGramas] = useState('')

  function buscar(v: string) {
    setTermo(v); setSelecionado(null)
    setSugestoes(v.length >= 2 ? buscarIngrediente(v) : [])
  }
  function selecionar(ing: Ingrediente) {
    setSelecionado(ing); setTermo(ing.nome); setGramas(String(ing.percapitaGramas)); setSugestoes([])
  }
  function confirmar() {
    if (!selecionado || !gramas) return
    onAdicionar({ nome: selecionado.nome, gramasPorPessoa: parseFloat(gramas), fc: selecionado.fatorCorrecao, fcc: selecionado.fatorCoccao, categoria: selecionado.categoria })
    setTermo(''); setSelecionado(null); setGramas('')
  }
  return (
    <div className="space-y-2">
      <div className="relative">
        <input type="text" value={termo} onChange={e => buscar(e.target.value)}
          placeholder="Adicionar ingrediente..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        {sugestoes.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
            style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
            {sugestoes.map(s => (
              <button key={s.nome} onClick={() => selecionar(s)}
                className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                style={{ borderBottom: '1px solid #E4F2EA', color: '#1A2E25' }}>
                <span>{s.nome}</span>
                <span className="text-xs" style={{ color: '#7BA892' }}>{s.percapitaGramas}g/p</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selecionado && (
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: '#E8F5EE' }}>
          <span className="flex-1 text-sm font-medium" style={{ color: '#1A2E25' }}>{selecionado.nome}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setGramas(v => String(Math.max(10, parseFloat(v || '0') - 10)))}
              className="w-7 h-7 rounded-full text-sm flex items-center justify-center"
              style={{ border: '1.5px solid #C8E4D4', background: '#fff' }}>−</button>
            <input type="number" value={gramas} onChange={e => setGramas(e.target.value)}
              className="w-14 text-center text-sm font-semibold outline-none bg-transparent" style={{ color: '#1A2E25' }} />
            <span className="text-xs" style={{ color: '#7BA892' }}>g</span>
            <button onClick={() => setGramas(v => String(parseFloat(v || '0') + 10))}
              className="w-7 h-7 rounded-full text-sm flex items-center justify-center"
              style={{ background: '#128C7E', color: '#fff' }}>+</button>
          </div>
          <button onClick={confirmar} className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#128C7E', color: '#fff' }}>
            Adicionar
          </button>
        </div>
      )}
    </div>
  )
}

export default function ReceitaPage() {
  const { id } = useParams<{ id: string }>()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [aba, setAba] = useState<Aba>('cardapio')

  // Cardápio
  const [adicionando, setAdicionando] = useState(false)
  const [nomeRefeicao, setNomeRefeicao] = useState('')
  const [ingredientes, setIngredientes] = useState<IngPrato[]>([])
  const [sugestoesReceita, setSugestoesReceita] = useState<Receita[]>([])
  const [receitaDaBase, setReceitaDaBase] = useState(false)

  // Financeiro
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null)
  const [editPrecoInput, setEditPrecoInput] = useState('')
  const [editandoVenda, setEditandoVenda] = useState(false)
  const [inputVenda, setInputVenda] = useState('')

  useEffect(() => {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const found = eventos.find((e: Evento) => e.id === id)
    if (found) setEvento({ precos: [], precoVenda: 0, ...found })
  }, [id])

  function salvar(novo: Evento) {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const idx = eventos.findIndex((e: Evento) => e.id === id)
    if (idx >= 0) { eventos[idx] = novo; localStorage.setItem('eventos', JSON.stringify(eventos)) }
    setEvento(novo)
  }

  function handleNome(v: string) {
    setNomeRefeicao(v); setReceitaDaBase(false)
    setSugestoesReceita(v.length >= 2 ? buscarReceita(v) : [])
  }

  function selecionarReceita(receita: Receita) {
    setNomeRefeicao(receita.nome)
    setIngredientes(resolverReceita(receita))
    setReceitaDaBase(true)
    setSugestoesReceita([])
  }

  function cancelar() {
    setAdicionando(false); setNomeRefeicao(''); setIngredientes([])
    setReceitaDaBase(false); setSugestoesReceita([])
  }

  function salvarRefeicao() {
    if (!nomeRefeicao || ingredientes.length === 0 || !evento) return
    const nova: Refeicao = { id: Date.now().toString(), nome: nomeRefeicao, ingredientes }
    salvar({ ...evento, refeicoes: [...evento.refeicoes, nova] })
    cancelar()
  }

  function removerRefeicao(refId: string) {
    if (!evento) return
    salvar({ ...evento, refeicoes: evento.refeicoes.filter(r => r.id !== refId) })
  }

  function ajustarGramas(idx: number, delta: number) {
    setIngredientes(prev => prev.map((ing, i) => i === idx ? { ...ing, gramasPorPessoa: Math.max(5, ing.gramasPorPessoa + delta) } : ing))
  }

  // Financeiro
  function todosIngredientes(): string[] {
    if (!evento) return []
    const set = new Set<string>()
    evento.refeicoes.forEach(r => r.ingredientes.forEach(i => set.add(i.nome)))
    return Array.from(set).sort()
  }

  function getPreco(nome: string): number {
    return evento?.precos?.find(p => p.nome === nome)?.precoKg ?? 0
  }

  function salvarPreco(nome: string, valor: number) {
    if (!evento) return
    const precos = (evento.precos || []).filter(p => p.nome !== nome)
    if (valor > 0) precos.push({ nome, precoKg: valor })
    salvar({ ...evento, precos })
    setEditandoPreco(null)
  }

  function salvarPrecoVenda(valor: number) {
    if (!evento) return
    salvar({ ...evento, precoVenda: valor })
    setEditandoVenda(false)
  }

  if (!evento) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F0F7F2' }}>
      <p style={{ color: '#5A7A68' }}>Carregando...</p>
    </div>
  )

  const equiv = totalEquivalente({ homens: evento.homens, mulheres: evento.mulheres, criancas: evento.criancas })
  const ingsUnicos = todosIngredientes()
  const precosFaltando = ingsUnicos.filter(n => getPreco(n) === 0).length

  // Custo total do evento
  let custoTotal = 0
  for (const ref of evento.refeicoes) {
    for (const ing of ref.ingredientes) {
      const precoKg = getPreco(ing.nome)
      if (precoKg > 0) {
        custoTotal += (ing.gramasPorPessoa / 1000) * ing.fc * precoKg * equiv
      }
    }
  }

  const custoPorConvidado = evento.totalPessoas > 0 ? custoTotal / evento.totalPessoas : 0
  const lucro = (evento.precoVenda || 0) - custoTotal
  const cmvEvento = evento.precoVenda > 0 ? calcularCMV(custoTotal, evento.precoVenda) : 0
  const precoSugerido30 = custoTotal > 0 ? custoTotal / 0.30 : 0

  const dataFormatada = evento.data
    ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <Link href="/dashboard" className="text-sm font-medium block mb-5" style={{ color: '#128C7E' }}>← Voltar</Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate" style={{ color: '#1A2E25' }}>{evento.nome}</h1>
            <p className="text-sm mt-1" style={{ color: '#5A7A68' }}>
              {evento.tipoEvento ? TIPO_LABELS[evento.tipoEvento] || evento.tipoEvento : 'Evento'}
              {' · '}{evento.totalPessoas} convidado{evento.totalPessoas !== 1 ? 's' : ''}
              {dataFormatada && ` · ${dataFormatada}`}
            </p>
          </div>
          {cmvEvento > 0 && (
            <div className="flex-shrink-0 px-3 py-2 rounded-2xl text-center" style={statusCMV(cmvEvento)}>
              <p className="text-xs font-semibold">CMV</p>
              <p className="text-sm font-bold">{cmvEvento.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 pb-4">
        {(['cardapio', 'financeiro'] as Aba[]).map(a => (
          <button key={a} onClick={() => setAba(a)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
            style={aba === a
              ? { background: '#128C7E', color: '#fff' }
              : { background: '#fff', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
            {a === 'cardapio' ? 'Cardápio' : 'Financeiro'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-10 space-y-4">

        {/* ── ABA CARDÁPIO ── */}
        {aba === 'cardapio' && (
          <>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base" style={{ color: '#1A2E25' }}>
                {evento.refeicoes.length > 0 ? `${evento.refeicoes.length} refeição${evento.refeicoes.length > 1 ? 'ões' : ''}` : 'Cardápio'}
              </p>
              {evento.refeicoes.length > 0 && !adicionando && (
                <button onClick={() => setAdicionando(true)}
                  className="text-sm font-semibold px-4 py-2 rounded-xl"
                  style={{ background: '#128C7E', color: '#fff' }}>
                  + Refeição
                </button>
              )}
            </div>

            {evento.refeicoes.map(ref => (
              <div key={ref.id} className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold" style={{ color: '#1A2E25' }}>{ref.nome}</p>
                  <button onClick={() => removerRefeicao(ref.id)} className="text-lg px-1" style={{ color: '#7BA892' }}>×</button>
                </div>
                <div className="space-y-1">
                  {ref.ingredientes.map((ing, i) => {
                    const bruto = (ing.gramasPorPessoa / 1000) * ing.fc * equiv
                    return (
                      <div key={i} className="flex justify-between text-sm py-1.5"
                        style={{ borderBottom: i < ref.ingredientes.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                        <span style={{ color: '#5A7A68' }}>{ing.nome}</span>
                        <span className="font-medium" style={{ color: '#1A2E25' }}>{fmtKg(bruto)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {adicionando ? (
              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #128C7E' }}>
                <p className="font-semibold mb-4" style={{ color: '#1A2E25' }}>Nova refeição</p>

                <div className="mb-4 relative">
                  <input type="text" value={nomeRefeicao} onChange={e => handleNome(e.target.value)}
                    placeholder="Nome (ex: Feijoada, Frango assado...)"
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
                  {sugestoesReceita.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
                      style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
                      {sugestoesReceita.map(r => (
                        <button key={r.id} onClick={() => selecionarReceita(r)}
                          className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                          style={{ borderBottom: '1px solid #E4F2EA', color: '#1A2E25' }}>
                          <span className="font-medium">{r.nome}</span>
                          <span className="text-xs" style={{ color: '#7BA892' }}>{r.ingredientes.length} ingredientes</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {receitaDaBase && ingredientes.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: '#E8F5EE' }}>
                    <span className="text-xs font-medium flex-1" style={{ color: '#1A2E25' }}>
                      {ingredientes.length} ingredientes carregados da base
                    </span>
                    <span className="text-xs" style={{ color: '#7BA892' }}>Ajuste se quiser</span>
                  </div>
                )}

                {ingredientes.length > 0 && (
                  <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #D4EDE0' }}>
                    {ingredientes.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: i < ingredientes.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                        <span className="text-sm flex-1" style={{ color: '#1A2E25' }}>{ing.nome}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => ajustarGramas(i, -10)}
                            className="w-7 h-7 rounded-full text-xs flex items-center justify-center"
                            style={{ border: '1px solid #C8E4D4', color: '#1A2E25', background: '#fff' }}>−</button>
                          <span className="text-sm font-medium w-12 text-center" style={{ color: '#1A2E25' }}>{ing.gramasPorPessoa}g</span>
                          <button onClick={() => ajustarGramas(i, 10)}
                            className="w-7 h-7 rounded-full text-xs flex items-center justify-center"
                            style={{ background: '#128C7E', color: '#fff' }}>+</button>
                          <button onClick={() => setIngredientes(prev => prev.filter((_, j) => j !== i))}
                            className="ml-1 text-base px-1" style={{ color: '#7BA892' }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <InputIngrediente onAdicionar={ing => setIngredientes(prev => [...prev, ing])} />

                <div className="flex gap-3 mt-4">
                  <button onClick={cancelar}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium"
                    style={{ border: '1.5px solid #C8E4D4', color: '#5A7A68', background: '#fff' }}>
                    Cancelar
                  </button>
                  <button onClick={salvarRefeicao} disabled={!nomeRefeicao || ingredientes.length === 0}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                    style={{ background: '#128C7E', color: '#fff' }}>
                    Salvar refeição
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdicionando(true)}
                className="w-full py-4 rounded-3xl text-sm font-semibold"
                style={{ border: '1.5px dashed #C8E4D4', color: '#128C7E', background: '#fff' }}>
                + Adicionar refeição ao cardápio
              </button>
            )}

            {!adicionando && evento.refeicoes.length > 0 && (
              <Link href={`/receita/${id}/lista`}
                className="w-full py-4 rounded-2xl font-semibold text-sm text-center block"
                style={{ background: '#128C7E', color: '#fff' }}>
                Gerar lista de compras
              </Link>
            )}
          </>
        )}

        {/* ── ABA FINANCEIRO ── */}
        {aba === 'financeiro' && (
          <>
            {evento.refeicoes.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-semibold mb-2" style={{ color: '#1A2E25' }}>Nenhuma refeição cadastrada</p>
                <p className="text-sm mb-5" style={{ color: '#5A7A68' }}>Monte o cardápio primeiro para calcular o CMV</p>
                <button onClick={() => setAba('cardapio')} className="px-5 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: '#128C7E', color: '#fff' }}>Montar cardápio</button>
              </div>
            ) : (
              <>
                {/* Preço cobrado do cliente */}
                <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7BA892' }}>Preço cobrado do cliente</p>
                  {editandoVenda ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: '#5A7A68' }}>R$</span>
                      <input type="number" value={inputVenda}
                        onChange={e => setInputVenda(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') salvarPrecoVenda(parseFloat(inputVenda)); if (e.key === 'Escape') setEditandoVenda(false) }}
                        autoFocus step="10" min="0" placeholder="0,00"
                        className="flex-1 px-4 py-3 rounded-2xl text-base outline-none font-semibold"
                        style={{ border: '1.5px solid #128C7E', background: '#F5FAF7', color: '#1A2E25' }} />
                      <button onClick={() => salvarPrecoVenda(parseFloat(inputVenda) || 0)}
                        className="px-4 py-3 rounded-2xl text-sm font-semibold"
                        style={{ background: '#128C7E', color: '#fff' }}>Salvar</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditandoVenda(true); setInputVenda(evento.precoVenda > 0 ? String(evento.precoVenda) : '') }}
                      className="w-full flex items-center justify-between"
                      style={{ color: '#1A2E25' }}>
                      <span className="text-2xl font-bold">
                        {evento.precoVenda > 0 ? formatarMoeda(evento.precoVenda) : '— Toque para definir'}
                      </span>
                      <span className="text-base opacity-50" style={{ color: '#7BA892' }}>✎</span>
                    </button>
                  )}
                  {custoTotal > 0 && evento.precoVenda === 0 && (
                    <p className="text-xs mt-3 font-medium" style={{ color: '#128C7E' }}>
                      Sugestão com 30% CMV: {formatarMoeda(precoSugerido30)}
                    </p>
                  )}
                </div>

                {/* Resumo financeiro */}
                {custoTotal > 0 && (
                  <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#7BA892' }}>Resumo financeiro</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#5A7A68' }}>Custo total dos insumos</span>
                        <span className="font-semibold" style={{ color: '#1A2E25' }}>{formatarMoeda(custoTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#5A7A68' }}>Custo por convidado</span>
                        <span className="font-semibold" style={{ color: '#1A2E25' }}>{formatarMoeda(custoPorConvidado)}</span>
                      </div>
                      {evento.precoVenda > 0 && (
                        <>
                          <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #E4F2EA' }}>
                            <span style={{ color: '#5A7A68' }}>Lucro bruto</span>
                            <span className="font-bold" style={{ color: lucro >= 0 ? '#128C7E' : '#E53935' }}>
                              {formatarMoeda(lucro)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: '#5A7A68' }}>Margem bruta</span>
                            <span className="font-semibold" style={{ color: lucro >= 0 ? '#128C7E' : '#E53935' }}>
                              {evento.precoVenda > 0 ? ((lucro / evento.precoVenda) * 100).toFixed(1) : '0'}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #E4F2EA' }}>
                            <span className="font-semibold" style={{ color: '#5A7A68' }}>CMV</span>
                            <span className="font-bold text-base" style={{ color: statusCMV(cmvEvento).color }}>
                              {cmvEvento.toFixed(1)}% — {statusCMV(cmvEvento).label}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Referência CMV */}
                {evento.precoVenda > 0 && (
                  <div className="bg-white rounded-3xl p-4" style={{ border: '1.5px solid #D4EDE0' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7BA892' }}>Referência</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="p-2 rounded-xl" style={{ background: '#E8F5EE', color: '#128C7E' }}>
                        <p className="font-bold">≤30%</p><p>Excelente</p>
                      </div>
                      <div className="p-2 rounded-xl" style={{ background: '#FFF8E1', color: '#F57C00' }}>
                        <p className="font-bold">≤42%</p><p>Atenção</p>
                      </div>
                      <div className="p-2 rounded-xl" style={{ background: '#FFEBEE', color: '#E53935' }}>
                        <p className="font-bold">&gt;42%</p><p>Crítico</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preços dos ingredientes */}
                <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #D4EDE0' }}>
                  <div className="px-5 py-3" style={{ borderBottom: '1px solid #E4F2EA', background: '#F5FAF7' }}>
                    <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#7BA892' }}>
                      Preços dos insumos
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#7BA892' }}>
                      Preço de compra por kg · {precosFaltando > 0 ? `${precosFaltando} sem preço` : 'todos preenchidos'}
                    </p>
                  </div>
                  {ingsUnicos.map((nome, i) => {
                    const preco = getPreco(nome)
                    return (
                      <div key={nome} className="px-5 py-4 flex items-center justify-between"
                        style={{ borderBottom: i < ingsUnicos.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                        <p className="text-sm flex-1" style={{ color: '#1A2E25' }}>{nome}</p>
                        {editandoPreco === nome ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: '#7BA892' }}>R$</span>
                            <input type="number" value={editPrecoInput}
                              onChange={e => setEditPrecoInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') salvarPreco(nome, parseFloat(editPrecoInput)); if (e.key === 'Escape') setEditandoPreco(null) }}
                              autoFocus step="0.01" min="0" placeholder="0,00"
                              className="w-20 text-right text-sm font-semibold outline-none rounded-lg px-2 py-0.5"
                              style={{ border: '1.5px solid #128C7E', color: '#1A2E25' }} />
                            <span className="text-xs" style={{ color: '#7BA892' }}>/kg</span>
                            <button onClick={() => salvarPreco(nome, parseFloat(editPrecoInput))}
                              className="font-bold text-sm" style={{ color: '#128C7E' }}>✓</button>
                            <button onClick={() => setEditandoPreco(null)} className="text-sm" style={{ color: '#7BA892' }}>×</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: preco > 0 ? '#1A2E25' : '#C8E4D4' }}>
                              {preco > 0 ? `R$ ${preco.toFixed(2)}/kg` : '—'}
                            </span>
                            <button onClick={() => { setEditandoPreco(nome); setEditPrecoInput(preco > 0 ? String(preco) : '') }}
                              className="text-base opacity-40 hover:opacity-80" style={{ color: '#7BA892' }}>✎</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
