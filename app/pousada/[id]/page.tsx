'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, type Receita } from '@/lib/receitas-db'
import { totalEquivalente } from '@/lib/percapita'
import { agruparPorSetor, gerarTextoWhatsApp, type ItemLista } from '@/lib/setores'
import { converterParaCompra } from '@/lib/unidades-compra'
import { baixarPDF } from '@/lib/exportar-pdf'
import { calcularCustoPorcao, calcularCMV, statusCMV, formatarMoeda, type PrecoIngrediente } from '@/lib/cmv'

interface IngPrato { nome: string; gramasPorcao: number; fc: number; categoria: string }
interface Refeicao { id: string; nome: string; tipo: string; ingredientes: IngPrato[] }
interface Hospedes { homens: number; mulheres: number; criancas: number }
interface Reserva { id: string; nome: string; homens: number; mulheres: number; criancas: number; dias: number }
interface Pousada {
  id: string; nome: string; totalQuartos: number
  hospedes: Hospedes; refeicoes: string[]
  diariaTipo: string; valorDiaria: number
  cardapio: Refeicao[]; precos: PrecoIngrediente[]
  reservas?: Reserva[]
}

type Aba = 'cardapio' | 'lista' | 'cmv'

const TIPO_LABELS: Record<string, string> = {
  cafe_manha: 'Café da manhã', almoco: 'Almoço', jantar: 'Jantar'
}

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
            <span className="text-xs" style={{ color: '#9B8B7A' }}>g/p</span>
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

export default function PousadaPage() {
  const { id } = useParams<{ id: string }>()
  const [pousada, setPousada] = useState<Pousada | null>(null)
  const [aba, setAba] = useState<Aba>('cardapio')

  // Cardápio
  const [addRef, setAddRef] = useState(false)
  const [nomeRef, setNomeRef] = useState('')
  const [tipoRef, setTipoRef] = useState('cafe_manha')
  const [ingsRef, setIngsRef] = useState<IngPrato[]>([])
  const [sugestoesReceita, setSugestoesReceita] = useState<Receita[]>([])

  // Lista
  const [diasLista, setDiasLista] = useState(7)
  const [hospedesLista, setHospedesLista] = useState<{ homens: number; mulheres: number; criancas: number } | null>(null)
  const [listaGerada, setListaGerada] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [modoOcupacao, setModoOcupacao] = useState<'hospedes' | 'quartos'>('hospedes')
  const [quartosOcupados, setQuartosOcupados] = useState(1)
  const [modoPlano, setModoPlano] = useState<'estimativa' | 'reservas'>('estimativa')
  const [addReserva, setAddReserva] = useState(false)
  const [reservaNome, setReservaNome] = useState('')
  const [reservaH, setReservaH] = useState(2)
  const [reservaM, setReservaM] = useState(0)
  const [reservaC, setReservaC] = useState(0)
  const [reservaDias, setReservaDias] = useState(3)

  // CMV
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null)
  const [editPrecoInput, setEditPrecoInput] = useState('')

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem('pousadas') || '[]')
    const found = lista.find((p: Pousada) => p.id === id)
    if (found) {
      setPousada(found)
      setHospedesLista(found.hospedes)
      setQuartosOcupados(Math.ceil(found.totalQuartos / 2))
    }
  }, [id])

  function salvar(nova: Pousada) {
    const lista = JSON.parse(localStorage.getItem('pousadas') || '[]')
    const idx = lista.findIndex((p: Pousada) => p.id === id)
    if (idx >= 0) { lista[idx] = nova; localStorage.setItem('pousadas', JSON.stringify(lista)) }
    setPousada(nova)
  }

  function handleNomeRef(v: string) {
    setNomeRef(v)
    setSugestoesReceita(v.length >= 2 ? buscarReceita(v) : [])
  }
  function selecionarReceita(r: Receita) {
    setNomeRef(r.nome)
    setIngsRef(resolverReceita(r).map(i => ({ nome: i.nome, gramasPorcao: i.gramasPorPessoa, fc: i.fc, categoria: i.categoria })))
    setSugestoesReceita([])
  }
  function salvarRefeicao() {
    if (!pousada || !nomeRef || ingsRef.length === 0) return
    const nova: Refeicao = { id: Date.now().toString(), nome: nomeRef, tipo: tipoRef, ingredientes: ingsRef }
    salvar({ ...pousada, cardapio: [...pousada.cardapio, nova] })
    setAddRef(false); setNomeRef(''); setIngsRef([]); setSugestoesReceita([])
  }
  function removerRefeicao(refId: string) {
    if (!pousada) return
    salvar({ ...pousada, cardapio: pousada.cardapio.filter(r => r.id !== refId) })
  }

  // Hóspedes efetivos conforme modo de ocupação
  function hospedesEfetivos(): { homens: number; mulheres: number; criancas: number } {
    if (!pousada || !hospedesLista) return { homens: 0, mulheres: 0, criancas: 0 }
    if (modoOcupacao === 'hospedes') return hospedesLista
    const totalBase = pousada.hospedes.homens + pousada.hospedes.mulheres + pousada.hospedes.criancas
    const porQuarto = pousada.totalQuartos > 0 ? totalBase / pousada.totalQuartos : 1
    const totalEfetivo = Math.round(quartosOcupados * porQuarto)
    const ratio = pousada.totalQuartos > 0 ? quartosOcupados / pousada.totalQuartos : 0
    return {
      homens: Math.round(pousada.hospedes.homens * ratio),
      mulheres: Math.round(pousada.hospedes.mulheres * ratio),
      criancas: Math.round(pousada.hospedes.criancas * ratio),
    }
  }

  // Reservas CRUD
  function salvarReservaItem() {
    if (!pousada || (reservaH + reservaM + reservaC) === 0 || reservaDias < 1) return
    const nova: Reserva = {
      id: Date.now().toString(),
      nome: reservaNome.trim(),
      homens: reservaH, mulheres: reservaM, criancas: reservaC,
      dias: reservaDias,
    }
    salvar({ ...pousada, reservas: [...(pousada.reservas ?? []), nova] })
    setAddReserva(false); setReservaNome(''); setReservaH(2); setReservaM(0); setReservaC(0); setReservaDias(3)
    setListaGerada(false)
  }
  function removerReserva(rid: string) {
    if (!pousada) return
    salvar({ ...pousada, reservas: (pousada.reservas ?? []).filter(r => r.id !== rid) })
    setListaGerada(false)
  }

  // Lista consolidada
  function calcularLista(): ItemLista[] {
    if (!pousada) return []
    const agg: Record<string, { categoria: string; bruto: number }> = {}

    if (modoPlano === 'reservas') {
      const reservas = pousada.reservas ?? []
      for (const res of reservas) {
        const equiv = totalEquivalente({ homens: res.homens, mulheres: res.mulheres, criancas: res.criancas })
        for (const ref of pousada.cardapio) {
          for (const ing of ref.ingredientes) {
            const bruto = (ing.gramasPorcao / 1000) * ing.fc * equiv * res.dias
            if (!agg[ing.nome]) agg[ing.nome] = { categoria: ing.categoria, bruto: 0 }
            agg[ing.nome].bruto += bruto
          }
        }
      }
    } else {
      if (!hospedesLista) return []
      const equiv = totalEquivalente(hospedesEfetivos())
      for (const ref of pousada.cardapio) {
        for (const ing of ref.ingredientes) {
          const bruto = (ing.gramasPorcao / 1000) * ing.fc * equiv * diasLista
          if (!agg[ing.nome]) agg[ing.nome] = { categoria: ing.categoria, bruto: 0 }
          agg[ing.nome].bruto += bruto
        }
      }
    }

    return Object.entries(agg).map(([nome, v]) => ({
      nome, categoria: v.categoria, brutoKg: v.bruto, liquidoKg: v.bruto,
      compra: converterParaCompra(nome, v.bruto),
    }))
  }

  const itensList = listaGerada ? calcularLista() : []
  const grupos = agruparPorSetor(itensList)

  function descOcupacao(): string {
    if (modoPlano === 'reservas') {
      const reservas = pousada?.reservas ?? []
      const totalNoites = reservas.reduce((s, r) => s + r.dias, 0)
      return `${reservas.length} reserva${reservas.length !== 1 ? 's' : ''} · ${totalNoites} noite${totalNoites !== 1 ? 's' : ''}`
    }
    const hef = hospedesEfetivos()
    const total = hef.homens + hef.mulheres + hef.criancas
    if (modoOcupacao === 'quartos') return `${quartosOcupados} quarto${quartosOcupados > 1 ? 's' : ''} (≈${total} hóspedes)`
    return `${total} hóspede${total !== 1 ? 's' : ''}`
  }

  async function exportarPDF() {
    if (!pousada || grupos.length === 0) return
    setGerando(true)
    await baixarPDF({
      nomeEvento: pousada.nome,
      totalPessoas: descOcupacao(),
      cenario: `${diasLista} dia${diasLista > 1 ? 's' : ''}`,
      grupos,
    })
    setGerando(false)
  }

  function enviarWhatsApp() {
    if (!pousada || grupos.length === 0) return
    const texto = gerarTextoWhatsApp({
      nomeEvento: pousada.nome,
      totalPessoas: descOcupacao(),
      cenario: `${diasLista} dias`,
      grupos,
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  // CMV
  function todosIngredientes(): string[] {
    if (!pousada) return []
    const set = new Set<string>()
    pousada.cardapio.forEach(r => r.ingredientes.forEach(i => set.add(i.nome)))
    return Array.from(set).sort()
  }
  function getPreco(nome: string): number {
    return pousada?.precos.find(p => p.nome === nome)?.precoKg ?? 0
  }
  function salvarPreco(nome: string, valor: number) {
    if (!pousada) return
    const precos = pousada.precos.filter(p => p.nome !== nome)
    if (valor > 0) precos.push({ nome, precoKg: valor })
    salvar({ ...pousada, precos })
    setEditandoPreco(null)
  }

  function custoRefeicaoPorPessoa(ref: Refeicao): number {
    if (!pousada) return 0
    return calcularCustoPorcao(
      ref.ingredientes.map(i => ({ nome: i.nome, gramasPorcao: i.gramasPorcao, fc: i.fc })),
      pousada.precos
    )
  }

  function custoTotalPorNoite(): number {
    if (!pousada || !hospedesLista) return 0
    const equiv = totalEquivalente(hospedesLista)
    return pousada.cardapio.reduce((sum, ref) => sum + custoRefeicaoPorPessoa(ref) * equiv, 0)
  }

  if (!pousada || !hospedesLista) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#1C1712' }}>
      <p style={{ color: '#9B8B7A' }}>Carregando...</p>
    </div>
  )

  const totalHosp = hospedesLista.homens + hospedesLista.mulheres + hospedesLista.criancas
  const custoNoite = custoTotalPorNoite()
  const receita = pousada.valorDiaria > 0
    ? (pousada.diariaTipo === 'por_quarto' ? pousada.valorDiaria : pousada.valorDiaria * totalHosp)
    : 0
  const cmvFB = receita > 0 ? calcularCMV(custoNoite, receita) : 0
  const ingredientes = todosIngredientes()

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#1C1712' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <Link href="/dashboard" className="text-sm font-medium block mb-5" style={{ color: '#C4823A' }}>← Voltar</Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate" style={{ color: '#F2EBE0' }}>{pousada.nome}</h1>
            <p className="text-sm mt-1" style={{ color: '#9B8B7A' }}>
              {pousada.totalQuartos} quartos · {pousada.refeicoes.map(r => TIPO_LABELS[r]).join(', ')}
            </p>
          </div>
          {cmvFB > 0 && (
            <div className="flex-shrink-0 px-3 py-2 rounded-2xl text-center" style={statusCMV(cmvFB)}>
              <p className="text-xs font-semibold">F&B CMV</p>
              <p className="text-sm font-bold">{cmvFB.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="flex px-5 gap-2 pb-4">
        {(['cardapio', 'lista', 'cmv'] as Aba[]).map(a => (
          <button key={a} onClick={() => setAba(a)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
            style={aba === a
              ? { background: '#C4823A', color: '#fff' }
              : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
            {a === 'cardapio' ? 'Cardápio' : a === 'lista' ? 'Lista' : 'CMV'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-10 space-y-4">

        {/* ── ABA CARDÁPIO ── */}
        {aba === 'cardapio' && (
          <>
            {pousada.cardapio.length === 0 && !addRef && (
              <div className="text-center py-10">
                <p className="font-semibold mb-1" style={{ color: '#F2EBE0' }}>Cardápio vazio</p>
                <p className="text-sm" style={{ color: '#9B8B7A' }}>Adicione as refeições que a pousada serve</p>
              </div>
            )}

            {pousada.cardapio.map(ref => {
              const custo = custoRefeicaoPorPessoa(ref)
              return (
                <div key={ref.id} className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold" style={{ color: '#F2EBE0' }}>{ref.nome}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>{TIPO_LABELS[ref.tipo] || ref.tipo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {custo > 0 && (
                        <span className="text-xs font-medium" style={{ color: '#C4823A' }}>{formatarMoeda(custo)}/p</span>
                      )}
                      <button onClick={() => removerRefeicao(ref.id)} className="text-lg px-1" style={{ color: '#9B8B7A' }}>×</button>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: '#9B8B7A' }}>{ref.ingredientes.length} ingrediente{ref.ingredientes.length !== 1 ? 's' : ''}</p>
                </div>
              )
            })}

            {addRef ? (
              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #C4823A' }}>
                <p className="font-semibold mb-4" style={{ color: '#F2EBE0' }}>Nova refeição</p>

                <div className="mb-3">
                  <p className="text-xs font-medium mb-2" style={{ color: '#9B8B7A' }}>Tipo</p>
                  <div className="flex gap-2 flex-wrap">
                    {pousada.refeicoes.map(r => (
                      <button key={r} onClick={() => setTipoRef(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={tipoRef === r
                          ? { background: '#C4823A', color: '#fff' }
                          : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                        {TIPO_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 relative">
                  <input value={nomeRef} onChange={e => handleNomeRef(e.target.value)}
                    placeholder="Nome (ex: Café da manhã completo...)"
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

                {ingsRef.length > 0 && (
                  <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                    {ingsRef.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: i < ingsRef.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                        <span className="text-sm flex-1" style={{ color: '#F2EBE0' }}>{ing.nome}</span>
                        <span className="text-sm font-medium mr-3" style={{ color: '#9B8B7A' }}>{ing.gramasPorcao}g</span>
                        <button onClick={() => setIngsRef(p => p.filter((_, j) => j !== i))}
                          className="text-base" style={{ color: '#9B8B7A' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <InputIngrediente onAdicionar={i => setIngsRef(p => [...p, i])} />

                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setAddRef(false); setNomeRef(''); setIngsRef([]) }}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium"
                    style={{ border: '1.5px solid #3A2E22', color: '#9B8B7A', background: '#252015' }}>Cancelar</button>
                  <button onClick={salvarRefeicao} disabled={!nomeRef || ingsRef.length === 0}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                    style={{ background: '#C4823A', color: '#fff' }}>Salvar refeição</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddRef(true)}
                className="w-full py-4 rounded-3xl text-sm font-semibold"
                style={{ border: '1.5px dashed #3A2E22', color: '#C4823A', background: '#252015' }}>
                + Adicionar refeição ao cardápio
              </button>
            )}
          </>
        )}

        {/* ── ABA LISTA ── */}
        {aba === 'lista' && (
          <>
            {pousada.cardapio.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-semibold mb-2" style={{ color: '#F2EBE0' }}>Nenhuma refeição cadastrada</p>
                <button onClick={() => setAba('cardapio')} className="px-5 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: '#C4823A', color: '#fff' }}>Montar cardápio</button>
              </div>
            ) : (
              <>
                {/* Modo de planejamento */}
                <div className="bg-white rounded-3xl p-4" style={{ border: '1.5px solid #3A2E22' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>Modo de planejamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'estimativa', label: 'Estimativa geral', desc: 'média de ocupação' },
                      { key: 'reservas', label: 'Por reservas', desc: 'reservas confirmadas' },
                    ].map(m => (
                      <button key={m.key} onClick={() => { setModoPlano(m.key as 'estimativa' | 'reservas'); setListaGerada(false) }}
                        className="py-3 rounded-2xl text-center"
                        style={modoPlano === m.key
                          ? { background: '#C4823A', color: '#fff' }
                          : { background: '#1C1712', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                        <p className="text-sm font-semibold">{m.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: modoPlano === m.key ? 'rgba(255,255,255,0.7)' : '#9B8B7A' }}>{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimativa geral */}
                {modoPlano === 'estimativa' && (
                  <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                    <p className="text-sm font-semibold mb-4" style={{ color: '#F2EBE0' }}>Configurar compra</p>

                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm" style={{ color: '#9B8B7A' }}>Dias de planejamento</p>
                        <span className="font-bold" style={{ color: '#C4823A' }}>{diasLista}</span>
                      </div>
                      <input type="range" min="1" max="30" value={diasLista}
                        onChange={e => { setDiasLista(parseInt(e.target.value)); setListaGerada(false) }}
                        className="w-full" style={{ accentColor: '#C4823A' }} />
                      <div className="flex justify-between text-xs mt-1" style={{ color: '#9B8B7A' }}>
                        <span>1 dia</span><span>15</span><span>30 dias</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2" style={{ color: '#9B8B7A' }}>Calcular por</p>
                      <div className="flex gap-2">
                        {[
                          { key: 'hospedes', label: 'Hóspedes' },
                          { key: 'quartos', label: 'Quartos ocupados' },
                        ].map(m => (
                          <button key={m.key} onClick={() => { setModoOcupacao(m.key as 'hospedes' | 'quartos'); setListaGerada(false) }}
                            className="flex-1 py-2 rounded-xl text-sm font-medium"
                            style={modoOcupacao === m.key
                              ? { background: '#C4823A', color: '#fff' }
                              : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {modoOcupacao === 'quartos' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm" style={{ color: '#9B8B7A' }}>Quartos ocupados</p>
                          <span className="font-bold" style={{ color: '#C4823A' }}>
                            {quartosOcupados} / {pousada.totalQuartos}
                          </span>
                        </div>
                        <input type="range" min="1" max={pousada.totalQuartos} value={quartosOcupados}
                          onChange={e => { setQuartosOcupados(parseInt(e.target.value)); setListaGerada(false) }}
                          className="w-full" style={{ accentColor: '#C4823A' }} />
                        <div className="flex justify-between text-xs mt-1" style={{ color: '#9B8B7A' }}>
                          <span>1 quarto</span><span>{pousada.totalQuartos} quartos</span>
                        </div>
                        {(() => {
                          const hef = hospedesEfetivos()
                          const total = hef.homens + hef.mulheres + hef.criancas
                          return total > 0 ? (
                            <p className="text-xs mt-2 font-medium" style={{ color: '#C4823A' }}>
                              ≈ {total} hóspede{total !== 1 ? 's' : ''} estimados ({hef.homens}H {hef.mulheres}M {hef.criancas}C)
                            </p>
                          ) : null
                        })()}
                      </div>
                    )}

                    {modoOcupacao === 'hospedes' && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium" style={{ color: '#9B8B7A' }}>Hóspedes no período</p>
                        {['homens', 'mulheres', 'criancas'].map(campo => (
                          <div key={campo} className="flex items-center justify-between">
                            <span className="text-sm capitalize" style={{ color: '#F2EBE0' }}>
                              {campo === 'homens' ? 'Homens' : campo === 'mulheres' ? 'Mulheres' : 'Crianças'}
                            </span>
                            <div className="flex items-center gap-3">
                              <button onClick={() => { setHospedesLista(h => h ? { ...h, [campo]: Math.max(0, (h[campo as keyof typeof h] as number) - 1) } : h); setListaGerada(false) }}
                                className="w-8 h-8 rounded-full" style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}>−</button>
                              <span className="w-5 text-center font-semibold" style={{ color: '#F2EBE0' }}>
                                {hospedesLista[campo as keyof typeof hospedesLista]}
                              </span>
                              <button onClick={() => { setHospedesLista(h => h ? { ...h, [campo]: (h[campo as keyof typeof h] as number) + 1 } : h); setListaGerada(false) }}
                                className="w-8 h-8 rounded-full" style={{ background: '#C4823A', color: '#fff' }}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Por reservas */}
                {modoPlano === 'reservas' && (
                  <>
                    {(pousada.reservas ?? []).length === 0 && !addReserva && (
                      <div className="text-center py-6">
                        <p className="text-sm mb-1 font-semibold" style={{ color: '#F2EBE0' }}>Nenhuma reserva adicionada</p>
                        <p className="text-xs mb-4" style={{ color: '#9B8B7A' }}>Adicione as reservas confirmadas para calcular com precisão</p>
                      </div>
                    )}

                    {(pousada.reservas ?? []).map(res => {
                      const total = res.homens + res.mulheres + res.criancas
                      const partes = [res.homens > 0 ? `${res.homens}H` : '', res.mulheres > 0 ? `${res.mulheres}M` : '', res.criancas > 0 ? `${res.criancas}C` : ''].filter(Boolean).join(' ')
                      return (
                        <div key={res.id} className="bg-white rounded-3xl px-5 py-4 flex items-center justify-between" style={{ border: '1.5px solid #3A2E22' }}>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: '#F2EBE0' }}>
                              {res.nome || `${total} hóspede${total !== 1 ? 's' : ''}`}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>
                              {partes} · {res.dias} noite{res.dias !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <button onClick={() => removerReserva(res.id)} className="text-lg px-1" style={{ color: '#9B8B7A' }}>×</button>
                        </div>
                      )
                    })}

                    {addReserva ? (
                      <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #C4823A' }}>
                        <p className="font-semibold mb-4 text-sm" style={{ color: '#F2EBE0' }}>Nova reserva</p>

                        <input value={reservaNome} onChange={e => setReservaNome(e.target.value)}
                          placeholder="Nome (opcional, ex: Família Silva)"
                          className="w-full px-4 py-3 rounded-2xl text-sm outline-none mb-4"
                          style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />

                        <div className="space-y-3 mb-4">
                          {[
                            { label: 'Homens', val: reservaH, set: setReservaH },
                            { label: 'Mulheres', val: reservaM, set: setReservaM },
                            { label: 'Crianças', val: reservaC, set: setReservaC },
                          ].map(({ label, val, set }) => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-sm" style={{ color: '#F2EBE0' }}>{label}</span>
                              <div className="flex items-center gap-3">
                                <button onClick={() => set(v => Math.max(0, v - 1))}
                                  className="w-8 h-8 rounded-full" style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}>−</button>
                                <span className="w-5 text-center font-semibold" style={{ color: '#F2EBE0' }}>{val}</span>
                                <button onClick={() => set(v => v + 1)}
                                  className="w-8 h-8 rounded-full" style={{ background: '#C4823A', color: '#fff' }}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm" style={{ color: '#9B8B7A' }}>Noites de estadia</p>
                            <span className="font-bold" style={{ color: '#C4823A' }}>{reservaDias}</span>
                          </div>
                          <input type="range" min="1" max="30" value={reservaDias}
                            onChange={e => setReservaDias(parseInt(e.target.value))}
                            className="w-full" style={{ accentColor: '#C4823A' }} />
                          <div className="flex justify-between text-xs mt-1" style={{ color: '#9B8B7A' }}>
                            <span>1 noite</span><span>15</span><span>30</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button onClick={() => { setAddReserva(false); setReservaNome(''); setReservaH(2); setReservaM(0); setReservaC(0); setReservaDias(3) }}
                            className="flex-1 py-3 rounded-2xl text-sm font-medium"
                            style={{ border: '1.5px solid #3A2E22', color: '#9B8B7A', background: '#252015' }}>Cancelar</button>
                          <button onClick={salvarReservaItem}
                            disabled={(reservaH + reservaM + reservaC) === 0}
                            className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                            style={{ background: '#C4823A', color: '#fff' }}>Salvar reserva</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddReserva(true)}
                        className="w-full py-4 rounded-3xl text-sm font-semibold"
                        style={{ border: '1.5px dashed #3A2E22', color: '#C4823A', background: '#252015' }}>
                        + Adicionar reserva
                      </button>
                    )}

                    {(pousada.reservas ?? []).length > 0 && !addReserva && (
                      <div className="px-2 py-1">
                        <p className="text-xs text-center" style={{ color: '#9B8B7A' }}>
                          {(pousada.reservas ?? []).length} reserva{(pousada.reservas ?? []).length !== 1 ? 's' : ''} · {(pousada.reservas ?? []).reduce((s, r) => s + r.dias, 0)} noites totais
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!addReserva && (
                  <button
                    onClick={() => setListaGerada(true)}
                    disabled={modoPlano === 'reservas' && (pousada.reservas ?? []).length === 0}
                    className="w-full py-4 rounded-2xl font-semibold text-sm disabled:opacity-40"
                    style={{ background: '#C4823A', color: '#fff' }}>
                    {modoPlano === 'estimativa'
                      ? `Gerar lista consolidada (${diasLista} dias)`
                      : `Gerar lista por reservas (${(pousada.reservas ?? []).length} reserva${(pousada.reservas ?? []).length !== 1 ? 's' : ''})`}
                  </button>
                )}

                {listaGerada && grupos.length > 0 && (
                  <>
                    <div className="flex gap-2">
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

        {/* ── ABA CMV ── */}
        {aba === 'cmv' && (
          <>
            {/* Resumo F&B */}
            {custoNoite > 0 && (
              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #3A2E22' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>F&B por noite</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9B8B7A' }}>Custo de alimentação</span>
                    <span className="font-semibold" style={{ color: '#F2EBE0' }}>{formatarMoeda(custoNoite)}</span>
                  </div>
                  {pousada.valorDiaria > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#9B8B7A' }}>Receita da diária</span>
                        <span className="font-semibold" style={{ color: '#F2EBE0' }}>{formatarMoeda(receita)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #3A2E22' }}>
                        <span className="font-semibold" style={{ color: '#9B8B7A' }}>CMV Alimentação / Diária</span>
                        <span className="font-bold text-base" style={{ color: statusCMV(cmvFB).color }}>
                          {cmvFB.toFixed(1)}% — {statusCMV(cmvFB).label}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* CMV por refeição */}
            {pousada.cardapio.length > 0 && (
              <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
                <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                  <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#9B8B7A' }}>Custo por refeição / pessoa</p>
                </div>
                {pousada.cardapio.map((ref, i) => {
                  const custo = custoRefeicaoPorPessoa(ref)
                  return (
                    <div key={ref.id} className="px-5 py-4 flex items-center justify-between"
                      style={{ borderBottom: i < pousada.cardapio.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#F2EBE0' }}>{ref.nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>{TIPO_LABELS[ref.tipo]}</p>
                      </div>
                      <span className="font-semibold" style={{ color: custo > 0 ? '#C4823A' : '#3A2E22' }}>
                        {custo > 0 ? formatarMoeda(custo) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Preços dos ingredientes */}
            <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #3A2E22' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#9B8B7A' }}>Preços dos ingredientes</p>
                <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>Preço de compra por kg</p>
              </div>
              {ingredientes.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm" style={{ color: '#9B8B7A' }}>Adicione refeições no Cardápio primeiro</p>
                </div>
              ) : ingredientes.map((nome, i) => {
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
          </>
        )}
      </div>
    </main>
  )
}
