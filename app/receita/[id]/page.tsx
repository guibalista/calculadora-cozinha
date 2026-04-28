'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, type Receita } from '@/lib/receitas-db'
import { calcularCMV, statusCMV, formatarMoeda, type PrecoIngrediente } from '@/lib/cmv'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; fcc: number; categoria: string }
interface Refeicao {
  id: string; nome: string; categoria?: string
  custoEstimado?: number; precoVenda?: number
  ingredientes: IngPrato[]
}
interface Evento {
  id: string; nome: string; tipoEvento?: string; data?: string
  totalPessoas: number; duracao?: string; perfilConsumo?: string
  // legacy compat
  homens?: number; mulheres?: number; criancas?: number
  refeicoes: Refeicao[]
  precos: PrecoIngrediente[]
  precoVenda: number
}

type Aba = 'cardapio' | 'financeiro'

const TIPO_LABELS: Record<string, string> = {
  churrasco: 'Churrasco', casamento: 'Casamento', formatura: 'Formatura',
  aniversario: 'Aniversário', corporativo: 'Corporativo',
  almoco: 'Almoço', jantar: 'Jantar', brunch: 'Brunch', outro: 'Evento',
}

const CAT_REFEICAO = [
  { key: 'entrada', label: 'Entrada' },
  { key: 'principal', label: 'Principal' },
  { key: 'acompanhamento', label: 'Acompanhamento' },
  { key: 'sobremesa', label: 'Sobremesa' },
  { key: 'bebida', label: 'Bebida' },
  { key: 'snack', label: 'Snack' },
]

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
          placeholder="Buscar ingrediente..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
        {sugestoes.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
            style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
            {sugestoes.map(s => (
              <button key={s.nome} onClick={() => selecionar(s)}
                className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                style={{ borderBottom: '1px solid #3A2E22', color: '#F2EBE0' }}>
                <span>{s.nome}</span>
                <span className="text-xs" style={{ color: '#9B8B7A' }}>{s.percapitaGramas}g/p</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selecionado && (
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: '#2A2118' }}>
          <span className="flex-1 text-sm font-medium" style={{ color: '#F2EBE0' }}>{selecionado.nome}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setGramas(v => String(Math.max(10, parseFloat(v || '0') - 10)))}
              className="w-7 h-7 rounded-full text-sm flex items-center justify-center"
              style={{ border: '1.5px solid #3A2E22', background: '#252015' }}>−</button>
            <input type="number" value={gramas} onChange={e => setGramas(e.target.value)}
              className="w-14 text-center text-sm font-semibold outline-none bg-transparent" style={{ color: '#F2EBE0' }} />
            <span className="text-xs" style={{ color: '#9B8B7A' }}>g</span>
            <button onClick={() => setGramas(v => String(parseFloat(v || '0') + 10))}
              className="w-7 h-7 rounded-full text-sm flex items-center justify-center"
              style={{ background: '#C4823A', color: '#fff' }}>+</button>
          </div>
          <button onClick={confirmar} className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#C4823A', color: '#fff' }}>
            Add
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
  const formRef = useRef<HTMLDivElement>(null)

  // Form de nova refeição
  const [adicionando, setAdicionando] = useState(false)
  const [nomeRefeicao, setNomeRefeicao] = useState('')
  const [catRefeicao, setCatRefeicao] = useState('principal')
  const [custoForm, setCustoForm] = useState('')
  const [precoForm, setPrecoForm] = useState('')
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
    if (found) setEvento({ precos: [], precoVenda: 0, duracao: 'tarde', perfilConsumo: 'moderado', ...found })
  }, [id])

  function salvar(novo: Evento) {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const idx = eventos.findIndex((e: Evento) => e.id === id)
    if (idx >= 0) { eventos[idx] = novo; localStorage.setItem('eventos', JSON.stringify(eventos)) }
    setEvento(novo)
  }

  function abrirForm() {
    setAdicionando(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
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
    setCustoForm(''); setPrecoForm(''); setReceitaDaBase(false); setSugestoesReceita([])
  }

  function salvarRefeicao() {
    if (!nomeRefeicao || ingredientes.length === 0 || !evento) return
    const nova: Refeicao = {
      id: Date.now().toString(), nome: nomeRefeicao, categoria: catRefeicao,
      custoEstimado: parseFloat(custoForm) || undefined,
      precoVenda: parseFloat(precoForm) || undefined,
      ingredientes,
    }
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
  function todosIngredientes() {
    if (!evento) return []
    const set = new Set<string>()
    evento.refeicoes.forEach(r => r.ingredientes.forEach(i => set.add(i.nome)))
    return Array.from(set).sort()
  }

  function getPreco(nome: string) {
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
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#1C1712' }}>
      <p style={{ color: '#9B8B7A' }}>Carregando...</p>
    </div>
  )

  // Cálculo financeiro
  const ingsUnicos = todosIngredientes()
  const precosFaltando = ingsUnicos.filter(n => getPreco(n) === 0).length

  const FATORES_PERFIL: Record<string, number> = { leve: 0.80, moderado: 1.00, intenso: 1.30 }
  const FATORES_DURACAO: Record<string, number> = { coquetel: 0.65, tarde: 1.00, noite: 1.15, dia: 1.45 }
  const fator = (FATORES_PERFIL[evento.perfilConsumo || 'moderado'] ?? 1) * (FATORES_DURACAO[evento.duracao || 'tarde'] ?? 1)
  const equiv = evento.totalPessoas * fator

  let custoTotal = 0
  for (const ref of evento.refeicoes) {
    for (const ing of ref.ingredientes) {
      const precoKg = getPreco(ing.nome)
      if (precoKg > 0) {
        custoTotal += (ing.gramasPorPessoa / 1000) * ing.fc * precoKg * equiv
      }
    }
  }

  // Usar custo manual por refeição como fallback se não tiver preços
  const custoManuais = evento.refeicoes.reduce((sum, r) => sum + (r.custoEstimado || 0), 0)
  const custoEfetivo = custoTotal > 0 ? custoTotal : custoManuais
  const custoPorConvidado = evento.totalPessoas > 0 ? custoEfetivo / evento.totalPessoas : 0
  const lucro = (evento.precoVenda || 0) - custoEfetivo
  const cmvEvento = evento.precoVenda > 0 ? calcularCMV(custoEfetivo, evento.precoVenda) : 0
  const precoSugerido30 = custoEfetivo > 0 ? custoEfetivo / 0.30 : 0

  const dataFormatada = evento.data
    ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const DURACAO_LABELS: Record<string, string> = { coquetel: 'Coquetel', tarde: 'Tarde', noite: 'Noite', dia: 'Dia inteiro' }
  const PERFIL_LABELS: Record<string, string> = { leve: 'Leve', moderado: 'Moderado', intenso: 'Intenso' }

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#1C1712' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <Link href="/dashboard" className="text-sm font-medium block mb-5" style={{ color: '#C4823A' }}>← Voltar</Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate" style={{ color: '#F2EBE0' }}>{evento.nome}</h1>
            <p className="text-sm mt-1" style={{ color: '#9B8B7A' }}>
              {evento.tipoEvento ? TIPO_LABELS[evento.tipoEvento] : 'Evento'}
              {' · '}{evento.totalPessoas} pessoas
              {evento.duracao && ` · ${DURACAO_LABELS[evento.duracao] || evento.duracao}`}
              {evento.perfilConsumo && ` · ${PERFIL_LABELS[evento.perfilConsumo] || evento.perfilConsumo}`}
            </p>
            {dataFormatada && <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>{dataFormatada}</p>}
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
              ? { background: '#C4823A', color: '#fff' }
              : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
            {a === 'cardapio' ? 'Cardápio' : 'Financeiro'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-10 space-y-4">

        {/* ── ABA CARDÁPIO ── */}
        {aba === 'cardapio' && (
          <>
            {/* FORM SEMPRE NO TOPO */}
            <div ref={formRef}>
              {adicionando ? (
                <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #C4823A' }}>
                  <p className="font-semibold mb-4" style={{ color: '#F2EBE0' }}>Nova refeição / prato</p>

                  {/* Nome com autocomplete */}
                  <div className="mb-3 relative">
                    <input type="text" value={nomeRefeicao} onChange={e => handleNome(e.target.value)}
                      placeholder="Nome (ex: Frango assado, Salada tropical...)"
                      className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                      style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}
                      autoFocus />
                    {sugestoesReceita.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
                        style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
                        {sugestoesReceita.map(r => (
                          <button key={r.id} onClick={() => selecionarReceita(r)}
                            className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                            style={{ borderBottom: '1px solid #3A2E22', color: '#F2EBE0' }}>
                            <span className="font-medium">{r.nome}</span>
                            <span className="text-xs" style={{ color: '#9B8B7A' }}>{r.ingredientes.length} ing.</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Categoria */}
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-2" style={{ color: '#9B8B7A' }}>Categoria</p>
                    <div className="flex flex-wrap gap-2">
                      {CAT_REFEICAO.map(c => (
                        <button key={c.key} onClick={() => setCatRefeicao(c.key)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium"
                          style={catRefeicao === c.key
                            ? { background: '#C4823A', color: '#fff' }
                            : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custo + Preço de venda */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Custo total (R$)</label>
                      <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl"
                        style={{ border: '1.5px solid #3A2E22', background: '#252015' }}>
                        <span className="text-xs" style={{ color: '#9B8B7A' }}>R$</span>
                        <input type="number" value={custoForm} onChange={e => setCustoForm(e.target.value)}
                          placeholder="0,00" step="0.01" min="0"
                          className="flex-1 text-sm font-semibold outline-none bg-transparent" style={{ color: '#F2EBE0' }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Preço de venda (R$)</label>
                      <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl"
                        style={{ border: '1.5px solid #3A2E22', background: '#252015' }}>
                        <span className="text-xs" style={{ color: '#9B8B7A' }}>R$</span>
                        <input type="number" value={precoForm} onChange={e => setPrecoForm(e.target.value)}
                          placeholder="0,00" step="0.01" min="0"
                          className="flex-1 text-sm font-semibold outline-none bg-transparent" style={{ color: '#F2EBE0' }} />
                      </div>
                    </div>
                  </div>

                  {/* Ingredientes carregados */}
                  {receitaDaBase && ingredientes.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: '#2A2118' }}>
                      <span className="text-xs font-medium flex-1" style={{ color: '#F2EBE0' }}>
                        {ingredientes.length} ingredientes da base
                      </span>
                      <span className="text-xs" style={{ color: '#9B8B7A' }}>Ajuste se quiser</span>
                    </div>
                  )}

                  {ingredientes.length > 0 && (
                    <div className="mb-3 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                      {ingredientes.map((ing, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3"
                          style={{ borderBottom: i < ingredientes.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                          <span className="text-sm flex-1" style={{ color: '#F2EBE0' }}>{ing.nome}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => ajustarGramas(i, -10)}
                              className="w-7 h-7 rounded-full text-xs flex items-center justify-center"
                              style={{ border: '1px solid #3A2E22', color: '#F2EBE0', background: '#252015' }}>−</button>
                            <span className="text-sm font-medium w-12 text-center" style={{ color: '#F2EBE0' }}>{ing.gramasPorPessoa}g</span>
                            <button onClick={() => ajustarGramas(i, 10)}
                              className="w-7 h-7 rounded-full text-xs flex items-center justify-center"
                              style={{ background: '#C4823A', color: '#fff' }}>+</button>
                            <button onClick={() => setIngredientes(prev => prev.filter((_, j) => j !== i))}
                              className="ml-1 text-base" style={{ color: '#9B8B7A' }}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <InputIngrediente onAdicionar={ing => setIngredientes(prev => [...prev, ing])} />

                  <div className="flex gap-3 mt-4">
                    <button onClick={cancelar}
                      className="flex-1 py-3 rounded-2xl text-sm font-medium"
                      style={{ border: '1.5px solid #3A2E22', color: '#9B8B7A', background: '#252015' }}>
                      Cancelar
                    </button>
                    <button onClick={salvarRefeicao} disabled={!nomeRefeicao || ingredientes.length === 0}
                      className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                      style={{ background: '#C4823A', color: '#fff' }}>
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={abrirForm}
                  className="w-full py-4 rounded-3xl text-sm font-semibold"
                  style={{ border: '1.5px dashed #3A2E22', color: '#C4823A', background: '#252015' }}>
                  + Adicionar refeição / prato
                </button>
              )}
            </div>

            {/* LISTA DE REFEIÇÕES — desce conforme adicionadas */}
            {evento.refeicoes.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: '#9B8B7A' }}>
                  {evento.refeicoes.length} refeição{evento.refeicoes.length > 1 ? 'ões' : ''} no cardápio
                </p>
                {evento.refeicoes.map(ref => {
                  const cmvRef = (ref.custoEstimado && ref.precoVenda)
                    ? calcularCMV(ref.custoEstimado, ref.precoVenda) : 0
                  return (
                    <div key={ref.id} className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold" style={{ color: '#F2EBE0' }}>{ref.nome}</p>
                          <p className="text-xs mt-0.5 capitalize" style={{ color: '#9B8B7A' }}>
                            {ref.categoria || 'principal'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {cmvRef > 0 && (
                            <span className="px-2 py-1 rounded-xl text-xs font-bold" style={statusCMV(cmvRef)}>
                              {cmvRef.toFixed(0)}%
                            </span>
                          )}
                          <button onClick={() => removerRefeicao(ref.id)} className="text-lg px-1" style={{ color: '#9B8B7A' }}>×</button>
                        </div>
                      </div>

                      {/* Custo / Preço inline */}
                      {(ref.custoEstimado || ref.precoVenda) && (
                        <div className="flex gap-4 text-xs mb-2 pt-2" style={{ borderTop: '1px solid #3A2E22' }}>
                          {ref.custoEstimado && (
                            <span style={{ color: '#9B8B7A' }}>Custo: <strong style={{ color: '#F2EBE0' }}>{formatarMoeda(ref.custoEstimado)}</strong></span>
                          )}
                          {ref.precoVenda && (
                            <span style={{ color: '#9B8B7A' }}>Venda: <strong style={{ color: '#C4823A' }}>{formatarMoeda(ref.precoVenda)}</strong></span>
                          )}
                        </div>
                      )}

                      <div className="space-y-1">
                        {ref.ingredientes.map((ing, i) => {
                          const bruto = (ing.gramasPorPessoa / 1000) * ing.fc * equiv
                          return (
                            <div key={i} className="flex justify-between text-sm py-1"
                              style={{ borderBottom: i < ref.ingredientes.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                              <span style={{ color: '#9B8B7A' }}>{ing.nome}</span>
                              <span className="font-medium" style={{ color: '#F2EBE0' }}>{fmtKg(bruto)} total</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <Link href={`/receita/${id}/lista`}
                  className="w-full py-4 rounded-2xl font-semibold text-sm text-center block"
                  style={{ background: '#C4823A', color: '#fff' }}>
                  Gerar lista de compras →
                </Link>
              </>
            )}
          </>
        )}

        {/* ── ABA FINANCEIRO ── */}
        {aba === 'financeiro' && (
          <>
            {evento.refeicoes.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-semibold mb-2" style={{ color: '#F2EBE0' }}>Nenhuma refeição cadastrada</p>
                <button onClick={() => setAba('cardapio')} className="px-5 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: '#C4823A', color: '#fff' }}>Montar cardápio</button>
              </div>
            ) : (
              <>
                {/* Preço cobrado */}
                <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9B8B7A' }}>Preço cobrado do cliente</p>
                  {editandoVenda ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: '#9B8B7A' }}>R$</span>
                      <input type="number" value={inputVenda}
                        onChange={e => setInputVenda(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') salvarPrecoVenda(parseFloat(inputVenda) || 0); if (e.key === 'Escape') setEditandoVenda(false) }}
                        autoFocus step="10" min="0" placeholder="0,00"
                        className="flex-1 px-4 py-3 rounded-2xl text-base outline-none font-semibold"
                        style={{ border: '1.5px solid #C4823A', background: '#252015', color: '#F2EBE0' }} />
                      <button onClick={() => salvarPrecoVenda(parseFloat(inputVenda) || 0)}
                        className="px-4 py-3 rounded-2xl text-sm font-semibold"
                        style={{ background: '#C4823A', color: '#fff' }}>OK</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditandoVenda(true); setInputVenda(evento.precoVenda > 0 ? String(evento.precoVenda) : '') }}
                      className="w-full flex items-center justify-between">
                      <span className="text-2xl font-bold" style={{ color: '#F2EBE0' }}>
                        {evento.precoVenda > 0 ? formatarMoeda(evento.precoVenda) : '— Toque para definir'}
                      </span>
                      <span style={{ color: '#9B8B7A' }}>✎</span>
                    </button>
                  )}
                  {custoEfetivo > 0 && evento.precoVenda === 0 && (
                    <p className="text-xs mt-2 font-medium" style={{ color: '#C4823A' }}>
                      Sugestão com 30% CMV: {formatarMoeda(precoSugerido30)}
                    </p>
                  )}
                </div>

                {/* Resumo */}
                {custoEfetivo > 0 && (
                  <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9B8B7A' }}>Resumo financeiro</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#9B8B7A' }}>Custo total dos insumos</span>
                        <span className="font-semibold" style={{ color: '#F2EBE0' }}>{formatarMoeda(custoEfetivo)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#9B8B7A' }}>Custo por pessoa</span>
                        <span className="font-semibold" style={{ color: '#F2EBE0' }}>{formatarMoeda(custoPorConvidado)}</span>
                      </div>
                      {evento.precoVenda > 0 && (
                        <>
                          <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #3A2E22' }}>
                            <span style={{ color: '#9B8B7A' }}>Lucro bruto</span>
                            <span className="font-bold" style={{ color: lucro >= 0 ? '#C4823A' : '#E53935' }}>
                              {formatarMoeda(lucro)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: '#9B8B7A' }}>Margem</span>
                            <span className="font-semibold" style={{ color: lucro >= 0 ? '#C4823A' : '#E53935' }}>
                              {((lucro / evento.precoVenda) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #3A2E22' }}>
                            <span className="font-semibold" style={{ color: '#9B8B7A' }}>CMV</span>
                            <span className="font-bold text-base" style={{ color: statusCMV(cmvEvento).color }}>
                              {cmvEvento.toFixed(1)}% — {statusCMV(cmvEvento).label}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* CMV por refeição (quando tem custo/preço por refeição) */}
                {evento.refeicoes.some(r => r.custoEstimado && r.precoVenda) && (
                  <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                    <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B8B7A' }}>CMV por prato</p>
                    </div>
                    {evento.refeicoes.filter(r => r.custoEstimado || r.precoVenda).map((ref, i) => {
                      const cmv = (ref.custoEstimado && ref.precoVenda) ? calcularCMV(ref.custoEstimado, ref.precoVenda) : 0
                      return (
                        <div key={ref.id} className="px-5 py-4 flex items-center justify-between"
                          style={{ borderBottom: i < evento.refeicoes.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#F2EBE0' }}>{ref.nome}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>
                              {ref.custoEstimado ? `Custo: ${formatarMoeda(ref.custoEstimado)}` : ''}
                              {ref.precoVenda ? ` · Venda: ${formatarMoeda(ref.precoVenda)}` : ''}
                            </p>
                          </div>
                          {cmv > 0 && (
                            <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold" style={statusCMV(cmv)}>
                              {cmv.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Preços por kg */}
                {ingsUnicos.length > 0 && (
                  <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                    <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B8B7A' }}>
                        Preços dos insumos (por kg)
                      </p>
                      {precosFaltando > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>{precosFaltando} sem preço</p>
                      )}
                    </div>
                    {ingsUnicos.map((nome, i) => {
                      const preco = getPreco(nome)
                      return (
                        <div key={nome} className="px-5 py-4 flex items-center justify-between"
                          style={{ borderBottom: i < ingsUnicos.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                          <p className="text-sm flex-1" style={{ color: '#F2EBE0' }}>{nome}</p>
                          {editandoPreco === nome ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs" style={{ color: '#9B8B7A' }}>R$</span>
                              <input type="number" value={editPrecoInput}
                                onChange={e => setEditPrecoInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') salvarPreco(nome, parseFloat(editPrecoInput)); if (e.key === 'Escape') setEditandoPreco(null) }}
                                autoFocus step="0.01" min="0" placeholder="0,00"
                                className="w-20 text-right text-sm font-semibold outline-none rounded-lg px-2 py-0.5"
                                style={{ border: '1.5px solid #C4823A', color: '#F2EBE0' }} />
                              <span className="text-xs" style={{ color: '#9B8B7A' }}>/kg</span>
                              <button onClick={() => salvarPreco(nome, parseFloat(editPrecoInput))}
                                className="font-bold text-sm" style={{ color: '#C4823A' }}>✓</button>
                              <button onClick={() => setEditandoPreco(null)} className="text-sm" style={{ color: '#9B8B7A' }}>×</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium" style={{ color: preco > 0 ? '#F2EBE0' : '#3A2E22' }}>
                                {preco > 0 ? `R$ ${preco.toFixed(2)}/kg` : '—'}
                              </span>
                              <button onClick={() => { setEditandoPreco(nome); setEditPrecoInput(preco > 0 ? String(preco) : '') }}
                                className="text-base opacity-40 hover:opacity-80" style={{ color: '#9B8B7A' }}>✎</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
