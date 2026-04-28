'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, type Receita } from '@/lib/receitas-db'
import { agruparPorSetor, gerarTextoWhatsApp, type ItemLista } from '@/lib/setores'
import { converterParaCompra } from '@/lib/unidades-compra'
import { baixarPDF } from '@/lib/exportar-pdf'
import { calcularCustoPorcao, calcularCMV, statusCMV, formatarMoeda, cmvMedio, precoSugerido, type PrecoIngrediente } from '@/lib/cmv'

interface IngPrato { nome: string; gramasPorcao: number; fc: number; categoria: string }
interface Prato { id: string; nome: string; categoria: string; precoVenda: number; ingredientes: IngPrato[] }
interface Restaurante { id: string; nome: string; tipo: string; pratos: Prato[]; precos: PrecoIngrediente[] }

type Aba = 'cardapio' | 'compra' | 'cmv'
type CatPrato = 'entrada' | 'principal' | 'acompanhamento' | 'sobremesa' | 'bebida' | 'petisco'

const CATEGORIAS: { key: CatPrato; label: string }[] = [
  { key: 'entrada', label: 'Entrada' },
  { key: 'principal', label: 'Principal' },
  { key: 'acompanhamento', label: 'Acompanhamento' },
  { key: 'sobremesa', label: 'Sobremesa' },
  { key: 'petisco', label: 'Petisco' },
  { key: 'bebida', label: 'Bebida' },
]

function InputIngrediente({ onAdicionar }: { onAdicionar: (i: IngPrato) => void }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<Ingrediente[]>([])
  const [sel, setSel] = useState<Ingrediente | null>(null)
  const [gramas, setGramas] = useState('')

  function buscar(v: string) { setTermo(v); setSel(null); setSugestoes(v.length >= 2 ? buscarIngrediente(v) : []) }
  function selecionar(s: Ingrediente) { setSel(s); setTermo(s.nome); setGramas(String(s.percapitaGramas)); setSugestoes([]) }
  function confirmar() {
    if (!sel || !gramas) return
    onAdicionar({ nome: sel.nome, gramasPorcao: parseFloat(gramas), fc: sel.fatorCorrecao, categoria: sel.categoria })
    setTermo(''); setSel(null); setGramas('')
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input value={termo} onChange={e => buscar(e.target.value)} placeholder="Adicionar ingrediente..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
        {sugestoes.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
            style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
            {sugestoes.map(s => (
              <button key={s.nome} onClick={() => selecionar(s)}
                className="w-full text-left px-4 py-3 text-sm flex justify-between"
                style={{ borderBottom: '1px solid #3A2E22', color: '#F2EBE0' }}>
                <span>{s.nome}</span>
                <span className="text-xs" style={{ color: '#9B8B7A' }}>{s.percapitaGramas}g/p</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {sel && (
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: '#2A2118' }}>
          <span className="flex-1 text-sm font-medium truncate" style={{ color: '#F2EBE0' }}>{sel.nome}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setGramas(v => String(Math.max(5, parseFloat(v || '0') - 10)))}
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
            Adicionar
          </button>
        </div>
      )}
    </div>
  )
}

export default function RestaurantePage() {
  const { id } = useParams<{ id: string }>()
  const [rest, setRest] = useState<Restaurante | null>(null)
  const [aba, setAba] = useState<Aba>('cardapio')

  // Cardápio state
  const [addPrato, setAddPrato] = useState(false)
  const [nomePrato, setNomePrato] = useState('')
  const [catPrato, setCatPrato] = useState<CatPrato>('principal')
  const [precoPrato, setPrecoPrato] = useState('')
  const [ingsPrato, setIngsPrato] = useState<IngPrato[]>([])
  const [sugestoesReceita, setSugestoesReceita] = useState<Receita[]>([])

  // Compra state
  const [porcoes, setPorcoes] = useState<Record<string, number>>({})
  const [listaGerada, setListaGerada] = useState(false)
  const [gerando, setGerando] = useState(false)

  // CMV state
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null)
  const [editPrecoInput, setEditPrecoInput] = useState('')

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem('restaurantes') || '[]')
    setRest(lista.find((r: Restaurante) => r.id === id) ?? null)
  }, [id])

  function salvar(novo: Restaurante) {
    const lista = JSON.parse(localStorage.getItem('restaurantes') || '[]')
    const idx = lista.findIndex((r: Restaurante) => r.id === id)
    if (idx >= 0) { lista[idx] = novo; localStorage.setItem('restaurantes', JSON.stringify(lista)) }
    setRest(novo)
  }

  function handleNomePrato(v: string) {
    setNomePrato(v)
    setSugestoesReceita(v.length >= 2 ? buscarReceita(v) : [])
  }

  function selecionarReceita(r: Receita) {
    setNomePrato(r.nome)
    setIngsPrato(resolverReceita(r).map(i => ({ nome: i.nome, gramasPorcao: i.gramasPorPessoa, fc: i.fc, categoria: i.categoria })))
    setSugestoesReceita([])
  }

  function salvarPrato() {
    if (!rest || !nomePrato || ingsPrato.length === 0) return
    const novo: Prato = {
      id: Date.now().toString(), nome: nomePrato, categoria: catPrato,
      precoVenda: parseFloat(precoPrato) || 0, ingredientes: ingsPrato,
    }
    salvar({ ...rest, pratos: [...rest.pratos, novo] })
    setAddPrato(false); setNomePrato(''); setPrecoPrato(''); setIngsPrato([]); setSugestoesReceita([])
  }

  function removerPrato(pratoId: string) {
    if (!rest) return
    salvar({ ...rest, pratos: rest.pratos.filter(p => p.id !== pratoId) })
  }

  // ── Compra ──────────────────────────────────────────────────
  function gerarLista() {
    setListaGerada(true)
    setAba('compra')
  }

  function totaisCompra(): ItemLista[] {
    if (!rest) return []
    const agg: Record<string, { categoria: string; bruto: number }> = {}
    for (const prato of rest.pratos) {
      const qty = porcoes[prato.id] || 0
      if (qty === 0) continue
      for (const ing of prato.ingredientes) {
        const bruto = (ing.gramasPorcao / 1000) * ing.fc * qty
        if (!agg[ing.nome]) agg[ing.nome] = { categoria: ing.categoria, bruto: 0 }
        agg[ing.nome].bruto += bruto
      }
    }
    return Object.entries(agg).map(([nome, v]) => ({
      nome, categoria: v.categoria, brutoKg: v.bruto, liquidoKg: v.bruto,
      compra: converterParaCompra(nome, v.bruto),
    }))
  }

  const itensList = totaisCompra()
  const grupos = itensList.length > 0 ? agruparPorSetor(itensList) : []
  const totalPorcoes = Object.values(porcoes).reduce((s, v) => s + v, 0)

  async function exportarPDF() {
    if (!rest || grupos.length === 0) return
    setGerando(true)
    await baixarPDF({ nomeEvento: rest.nome, totalPessoas: `${totalPorcoes} porções`, cenario: 'Compra do dia', grupos })
    setGerando(false)
  }

  function enviarWhatsApp() {
    if (!rest || grupos.length === 0) return
    const texto = gerarTextoWhatsApp({ nomeEvento: rest.nome, totalPessoas: `${totalPorcoes} porções`, cenario: 'Compra do dia', grupos })
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  // ── CMV ─────────────────────────────────────────────────────
  function todosIngredientes(): string[] {
    if (!rest) return []
    const set = new Set<string>()
    rest.pratos.forEach(p => p.ingredientes.forEach(i => set.add(i.nome)))
    return Array.from(set).sort()
  }

  function getPreco(nome: string): number {
    return rest?.precos.find(p => p.nome === nome)?.precoKg ?? 0
  }

  function salvarPreco(nome: string, valor: number) {
    if (!rest) return
    const precos = rest.precos.filter(p => p.nome !== nome)
    if (valor > 0) precos.push({ nome, precoKg: valor })
    salvar({ ...rest, precos })
    setEditandoPreco(null)
  }

  function custoPrato(prato: Prato): number {
    return calcularCustoPorcao(
      prato.ingredientes.map(i => ({ nome: i.nome, gramasPorcao: i.gramasPorcao, fc: i.fc })),
      rest?.precos ?? []
    )
  }

  if (!rest) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#1C1712' }}>
      <p style={{ color: '#9B8B7A' }}>Carregando...</p>
    </div>
  )

  const ingredientes = todosIngredientes()
  const cmvGeral = cmvMedio(rest.pratos.map(p => ({ custo: custoPrato(p), precoVenda: p.precoVenda })))

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#1C1712' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <Link href="/dashboard" className="text-sm font-medium block mb-5" style={{ color: '#C4823A' }}>← Voltar</Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate" style={{ color: '#F2EBE0' }}>{rest.nome}</h1>
            <p className="text-sm mt-1 capitalize" style={{ color: '#9B8B7A' }}>{rest.tipo} · {rest.pratos.length} prato{rest.pratos.length !== 1 ? 's' : ''}</p>
          </div>
          {cmvGeral > 0 && (
            <div className="flex-shrink-0 px-3 py-2 rounded-2xl text-center" style={statusCMV(cmvGeral)}>
              <p className="text-xs font-semibold">{statusCMV(cmvGeral).label}</p>
              <p className="text-sm font-bold">{cmvGeral.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="flex px-5 gap-2 pb-4">
        {(['cardapio', 'compra', 'cmv'] as Aba[]).map(a => (
          <button key={a} onClick={() => setAba(a)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold capitalize"
            style={aba === a
              ? { background: '#C4823A', color: '#fff' }
              : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
            {a === 'cardapio' ? 'Cardápio' : a === 'compra' ? 'Compra' : 'CMV'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-10 space-y-4">

        {/* ── ABA CARDÁPIO ───────────────────────────────── */}
        {aba === 'cardapio' && (
          <>
            {rest.pratos.length === 0 && !addPrato && (
              <div className="text-center py-10">
                <p className="font-semibold mb-1" style={{ color: '#F2EBE0' }}>Cardápio vazio</p>
                <p className="text-sm mb-5" style={{ color: '#9B8B7A' }}>Adicione pratos para calcular CMV e gerar listas de compra</p>
              </div>
            )}

            {rest.pratos.map(prato => {
              const custo = custoPrato(prato)
              const cmv = calcularCMV(custo, prato.precoVenda)
              const status = statusCMV(cmv)
              return (
                <div key={prato.id} className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base" style={{ color: '#F2EBE0' }}>{prato.nome}</p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: '#9B8B7A' }}>{prato.categoria}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {prato.precoVenda > 0 && (
                        <div className="px-2 py-1 rounded-xl text-center" style={status}>
                          <p className="text-xs font-bold">{cmv.toFixed(0)}%</p>
                        </div>
                      )}
                      <button onClick={() => removerPrato(prato.id)} className="text-lg px-1" style={{ color: '#9B8B7A' }}>×</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9B8B7A' }}>{prato.ingredientes.length} ingrediente{prato.ingredientes.length !== 1 ? 's' : ''}</span>
                    <span className="font-semibold" style={{ color: prato.precoVenda > 0 ? '#F2EBE0' : '#9B8B7A' }}>
                      {prato.precoVenda > 0 ? formatarMoeda(prato.precoVenda) : 'Sem preço'}
                    </span>
                  </div>
                  {custo > 0 && (
                    <div className="mt-2 pt-2 flex justify-between text-xs" style={{ borderTop: '1px solid #3A2E22' }}>
                      <span style={{ color: '#9B8B7A' }}>Custo por porção</span>
                      <span className="font-medium" style={{ color: '#C4823A' }}>{formatarMoeda(custo)}</span>
                    </div>
                  )}
                </div>
              )
            })}

            {addPrato ? (
              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #C4823A' }}>
                <p className="font-semibold mb-4" style={{ color: '#F2EBE0' }}>Novo prato</p>

                {/* Nome com autocomplete de receitas */}
                <div className="mb-3 relative">
                  <input value={nomePrato} onChange={e => handleNomePrato(e.target.value)}
                    placeholder="Nome do prato..."
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
                  {sugestoesReceita.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
                      style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
                      {sugestoesReceita.map(r => (
                        <button key={r.id} onClick={() => selecionarReceita(r)}
                          className="w-full text-left px-4 py-3 text-sm flex justify-between"
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
                    {CATEGORIAS.map(c => (
                      <button key={c.key} onClick={() => setCatPrato(c.key)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={catPrato === c.key
                          ? { background: '#C4823A', color: '#fff' }
                          : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço de venda */}
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Preço de venda (R$)</label>
                  <input type="number" value={precoPrato} onChange={e => setPrecoPrato(e.target.value)}
                    placeholder="0,00" step="0.01" min="0"
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
                </div>

                {/* Ingredientes */}
                {ingsPrato.length > 0 && (
                  <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                    {ingsPrato.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: i < ingsPrato.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                        <span className="text-sm flex-1" style={{ color: '#F2EBE0' }}>{ing.nome}</span>
                        <span className="text-sm font-medium mr-3" style={{ color: '#9B8B7A' }}>{ing.gramasPorcao}g</span>
                        <button onClick={() => setIngsPrato(p => p.filter((_, j) => j !== i))}
                          className="text-base" style={{ color: '#9B8B7A' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <InputIngrediente onAdicionar={i => setIngsPrato(p => [...p, i])} />

                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setAddPrato(false); setNomePrato(''); setPrecoPrato(''); setIngsPrato([]) }}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium"
                    style={{ border: '1.5px solid #3A2E22', color: '#9B8B7A', background: '#252015' }}>
                    Cancelar
                  </button>
                  <button onClick={salvarPrato} disabled={!nomePrato || ingsPrato.length === 0}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                    style={{ background: '#C4823A', color: '#fff' }}>
                    Salvar prato
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddPrato(true)}
                className="w-full py-4 rounded-3xl text-sm font-semibold"
                style={{ border: '1.5px dashed #3A2E22', color: '#C4823A', background: '#252015' }}>
                + Adicionar prato ao cardápio
              </button>
            )}
          </>
        )}

        {/* ── ABA COMPRA ─────────────────────────────────── */}
        {aba === 'compra' && (
          <>
            {rest.pratos.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-semibold mb-2" style={{ color: '#F2EBE0' }}>Nenhum prato cadastrado</p>
                <button onClick={() => setAba('cardapio')} className="px-5 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: '#C4823A', color: '#fff' }}>Montar cardápio</button>
              </div>
            ) : (
              <>
                <p className="text-sm" style={{ color: '#9B8B7A' }}>Quantas porções de cada prato hoje?</p>
                {rest.pratos.map(prato => (
                  <div key={prato.id} className="bg-white rounded-3xl px-5 py-4 flex items-center justify-between"
                    style={{ border: '1.5px solid #3A2E22' }}>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm" style={{ color: '#F2EBE0' }}>{prato.nome}</p>
                      <p className="text-xs capitalize mt-0.5" style={{ color: '#9B8B7A' }}>{prato.categoria}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => setPorcoes(p => ({ ...p, [prato.id]: Math.max(0, (p[prato.id] || 0) - 1) }))}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}>−</button>
                      <span className="w-8 text-center font-semibold" style={{ color: '#F2EBE0' }}>
                        {porcoes[prato.id] || 0}
                      </span>
                      <button onClick={() => setPorcoes(p => ({ ...p, [prato.id]: (p[prato.id] || 0) + 1 }))}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: '#C4823A', color: '#fff' }}>+</button>
                    </div>
                  </div>
                ))}

                {totalPorcoes > 0 && (
                  <button onClick={gerarLista}
                    className="w-full py-4 rounded-2xl font-semibold text-sm"
                    style={{ background: '#C4823A', color: '#fff' }}>
                    Gerar lista de compras ({totalPorcoes} porções)
                  </button>
                )}

                {listaGerada && grupos.length > 0 && (
                  <>
                    <div className="flex gap-2 pt-2">
                      <button onClick={enviarWhatsApp}
                        className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                        style={{ background: '#25D366', color: '#fff' }}>WhatsApp</button>
                      <button onClick={exportarPDF} disabled={gerando}
                        className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-60"
                        style={{ background: '#C4823A', color: '#fff' }}>
                        {gerando ? 'Gerando...' : 'Baixar PDF'}
                      </button>
                    </div>
                    {grupos.map(grupo => (
                      <div key={grupo.setor} className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                        <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                          <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#9B8B7A' }}>{grupo.setor}</p>
                        </div>
                        {grupo.itens.map((item, i) => (
                          <div key={i} className="px-5 py-4 flex items-center justify-between"
                            style={{ borderBottom: i < grupo.itens.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                            <p className="text-base" style={{ color: '#F2EBE0' }}>{item.nome}</p>
                            <p className="font-semibold text-base" style={{ color: '#F2EBE0' }}>{item.compra}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── ABA CMV ────────────────────────────────────── */}
        {aba === 'cmv' && (
          <>
            {/* Resumo geral */}
            {rest.pratos.length > 0 && cmvGeral > 0 && (
              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>CMV Geral</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold" style={{ color: statusCMV(cmvGeral).color }}>{cmvGeral.toFixed(1)}%</p>
                    <p className="text-sm mt-0.5" style={{ color: '#9B8B7A' }}>{statusCMV(cmvGeral).label}</p>
                  </div>
                  <div className="text-right text-sm" style={{ color: '#9B8B7A' }}>
                    <p>Meta ideal: 28–35%</p>
                    <p className="mt-0.5">Atenção: 35–42%</p>
                    <p className="mt-0.5">Crítico: acima de 42%</p>
                  </div>
                </div>
              </div>
            )}

            {/* CMV por prato */}
            {rest.pratos.length > 0 && (
              <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                  <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#9B8B7A' }}>CMV por prato</p>
                </div>
                {rest.pratos.map((prato, i) => {
                  const custo = custoPrato(prato)
                  const cmv = calcularCMV(custo, prato.precoVenda)
                  const status = statusCMV(cmv)
                  const sugestao = precoSugerido(custo)
                  return (
                    <div key={prato.id} className="px-5 py-4"
                      style={{ borderBottom: i < rest.pratos.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm" style={{ color: '#F2EBE0' }}>{prato.nome}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>
                            Custo: {custo > 0 ? formatarMoeda(custo) : '—'}
                            {prato.precoVenda > 0 && ` · Venda: ${formatarMoeda(prato.precoVenda)}`}
                          </p>
                          {custo > 0 && prato.precoVenda === 0 && (
                            <p className="text-xs mt-0.5" style={{ color: '#C4823A' }}>
                              Preço sugerido (33% CMV): {formatarMoeda(sugestao)}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-3 px-2.5 py-1.5 rounded-xl text-center" style={status}>
                          <p className="text-xs font-bold">{cmv > 0 ? `${cmv.toFixed(1)}%` : '—'}</p>
                          <p className="text-xs">{status.label}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Preços dos ingredientes */}
            <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#9B8B7A' }}>
                  Preços dos ingredientes
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>Informe o preço de compra por kg</p>
              </div>
              {ingredientes.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm" style={{ color: '#9B8B7A' }}>Adicione pratos no Cardápio primeiro</p>
                </div>
              ) : (
                ingredientes.map((nome, i) => {
                  const preco = getPreco(nome)
                  return (
                    <div key={nome} className="px-5 py-4 flex items-center justify-between"
                      style={{ borderBottom: i < ingredientes.length - 1 ? '1px solid #3A2E22' : 'none' }}>
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
                          <button onClick={() => setEditandoPreco(null)}
                            className="text-sm" style={{ color: '#9B8B7A' }}>×</button>
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
                })
              )}
            </div>

            {ingredientes.length > 0 && rest.precos.length < ingredientes.length && (
              <p className="text-xs text-center" style={{ color: '#9B8B7A' }}>
                {ingredientes.length - rest.precos.length} ingrediente{ingredientes.length - rest.precos.length > 1 ? 's' : ''} sem preço — o CMV ficará incompleto
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
