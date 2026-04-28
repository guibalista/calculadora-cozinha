'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { buscarIngrediente, buscarIngredienteIA, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, buscarReceitaComIA, type Receita, type ReceitaIAData } from '@/lib/receitas-db'
import { totalEquivalente, somarHospedes } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; fcc: number; categoria: string }
interface Prato { id: string; nome: string; ingredientes: IngPrato[] }
interface Dia { indice: number; label: string; data?: string; pratos: Prato[]; extrasHomens: number; extrasMulheres: number; extrasCriancas: number }
interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numero_dias: number; data_inicio?: string; data_fim?: string; dias: Dia[] }
type SugestaoIA = { nome: string; tipo: string; ingredientes: IngPrato[] }

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
function gerarDias(dataInicio: string, dataFim: string): Dia[] {
  const inicio = new Date(dataInicio + 'T12:00:00')
  const fim = new Date(dataFim + 'T12:00:00')
  const dias: Dia[] = []
  const atual = new Date(inicio)
  while (atual <= fim) {
    const d = DIAS_SEMANA[atual.getDay()]
    const dd = atual.getDate().toString().padStart(2, '0')
    const mm = (atual.getMonth() + 1).toString().padStart(2, '0')
    dias.push({ indice: dias.length, label: `${d} ${dd}/${mm}`, data: atual.toISOString().split('T')[0], pratos: [], extrasHomens: 0, extrasMulheres: 0, extrasCriancas: 0 })
    atual.setDate(atual.getDate() + 1)
  }
  return dias
}

function InputReceita({
  onChange,
  onSelect,
  hospedes,
}: {
  onChange: (v: string) => void
  onSelect: (nome: string, ings: IngPrato[], fromIA: boolean) => void
  hospedes: { homens: number; mulheres: number; criancas: number } | null
}) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<Receita[]>([])
  const [buscandoIA, setBuscandoIA] = useState(false)
  const [receitaIA, setReceitaIA] = useState<ReceitaIAData | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function buscar(v: string) {
    setTermo(v)
    onChange(v)
    setReceitaIA(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (v.length < 2) { setSugestoes([]); return }

    const locais = buscarReceita(v)
    setSugestoes(locais)

    timerRef.current = setTimeout(async () => {
      setBuscandoIA(true)
      try {
        const dados = await buscarReceitaComIA(v, {
          homens: hospedes?.homens ?? 0,
          mulheres: hospedes?.mulheres ?? 0,
          criancas: hospedes?.criancas ?? 0,
        })
        if (dados) {
          const nomeNorm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
          const jaExiste = locais.some(r => nomeNorm(r.nome) === nomeNorm(dados.nome))
          if (!jaExiste) setReceitaIA(dados)
        }
      } finally {
        setBuscandoIA(false)
      }
    }, 400)
  }

  function selecionar(receita: Receita) {
    const ings = resolverReceita(receita)
    setTermo(receita.nome)
    setSugestoes([])
    setReceitaIA(null)
    onSelect(receita.nome, ings, false)
  }

  function selecionarIA(r: ReceitaIAData) {
    const ings: IngPrato[] = r.ingredientes.map(ing => {
      const local = buscarIngrediente(ing.nome)[0]
      return { nome: ing.nome, gramasPorPessoa: ing.gramasPorPessoa, fc: local?.fatorCorrecao ?? 1.10, fcc: local?.fatorCoccao ?? 1.0, categoria: ing.categoria }
    })
    setTermo(r.nome)
    setSugestoes([])
    setReceitaIA(null)
    onSelect(r.nome, ings, true)
  }

  return (
    <div className="mb-4 relative">
      <input type="text" value={termo} onChange={e => buscar(e.target.value)}
        placeholder="Nome da refeição (ex: Feijoada, Frango assado...)"
        className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
        style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
      {buscandoIA && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#128C7E', borderTopColor: 'transparent' }} />
        </div>
      )}
      {(sugestoes.length > 0 || receitaIA || buscandoIA) && termo.length >= 2 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
          style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
          {sugestoes.map(r => (
            <button key={r.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => selecionar(r)}
              className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
              style={{ borderBottom: '1px solid #E4F2EA', color: '#1A2E25' }}>
              <span className="font-medium">{r.nome}</span>
              <span className="text-xs" style={{ color: '#7BA892' }}>{r.ingredientes.length} ingredientes</span>
            </button>
          ))}
          {buscandoIA && !receitaIA && (
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                style={{ borderColor: '#128C7E', borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: '#7BA892' }}>Identificando receita...</span>
            </div>
          )}
          {receitaIA && (
            <>
              {sugestoes.length > 0 && (
                <div className="px-4 py-1.5" style={{ background: '#F5FAF7', borderBottom: '1px solid #E4F2EA' }}>
                  <span className="text-xs font-medium" style={{ color: '#7BA892' }}>Identificado pela IA</span>
                </div>
              )}
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => selecionarIA(receitaIA)}
                className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                style={{ color: '#1A2E25' }}>
                <span className="font-medium">{receitaIA.nome}</span>
                <span className="text-xs" style={{ color: '#7BA892' }}>{receitaIA.ingredientes.length} ingredientes</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function InputIngrediente({ onAdicionar, receitaNome }: { onAdicionar: (ing: IngPrato) => void; receitaNome?: string }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<Ingrediente[]>([])
  const [selecionado, setSelecionado] = useState<Ingrediente | null>(null)
  const [gramas, setGramas] = useState('')
  const [buscandoIA, setBuscandoIA] = useState(false)
  const [veioDaIA, setVeioDaIA] = useState(false)
  const [padrao, setPadrao] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function buscar(v: string) {
    setTermo(v)
    setSelecionado(null)
    setVeioDaIA(false)
    setPadrao(null)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (v.length < 2) { setSugestoes([]); return }

    const locais = buscarIngrediente(v)
    setSugestoes(locais)

    if (locais.length === 0) {
      timerRef.current = setTimeout(async () => {
        setBuscandoIA(true)
        const ing = await buscarIngredienteIA(v, receitaNome)
        setSugestoes([ing])
        setVeioDaIA(true)
        setBuscandoIA(false)
      }, 500)
    }
  }

  function selecionar(ing: Ingrediente) {
    setSelecionado(ing)
    setTermo(ing.nome)
    setGramas(String(ing.percapitaGramas))
    setPadrao(ing.percapitaGramas)
    setSugestoes([])
  }
  function confirmar() {
    if (!selecionado || !gramas) return
    const nome = termo.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    onAdicionar({ nome, gramasPorPessoa: parseFloat(gramas), fc: selecionado.fatorCorrecao, fcc: selecionado.fatorCoccao, categoria: selecionado.categoria })
    setTermo(''); setSelecionado(null); setGramas(''); setVeioDaIA(false); setPadrao(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input type="text" value={termo} onChange={e => buscar(e.target.value)}
          placeholder="Adicionar ingrediente..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        {buscandoIA && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#128C7E', borderTopColor: 'transparent' }} />
          </div>
        )}
        {sugestoes.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
            style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
            {veioDaIA && (
              <div className="px-4 py-1.5" style={{ background: '#F5FAF7', borderBottom: '1px solid #E4F2EA' }}>
                <span className="text-xs font-medium" style={{ color: '#7BA892' }}>Identificado pela IA</span>
              </div>
            )}
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
        <div className="p-3 rounded-2xl space-y-2" style={{ background: '#E8F5EE' }}>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm font-medium truncate" style={{ color: '#1A2E25' }}>{termo || selecionado.nome}</span>
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
          {padrao !== null && parseFloat(gramas) !== padrao && (
            <p className="text-xs" style={{ color: '#7BA892' }}>
              padrão: {padrao}g/p ·{' '}
              <button onClick={() => setGramas(String(padrao))} className="underline">restaurar</button>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function EstadiaPage() {
  const { id } = useParams<{ id: string }>()
  const [estadia, setEstadia] = useState<Estadia | null>(null)
  const [diaAtivo, setDiaAtivo] = useState(0)

  const [adicionandoPrato, setAdicionandoPrato] = useState(false)
  const [nomePrato, setNomePrato] = useState('')
  const [ingredientes, setIngredientes] = useState<IngPrato[]>([])
  const [receitaDaBase, setReceitaDaBase] = useState(false)
  const [receitaVeioDaIA, setReceitaVeioDaIA] = useState(false)

  const [sugestoesIA, setSugestoesIA] = useState<SugestaoIA[]>([])
  const [carregandoIA, setCarregandoIA] = useState(false)
  const [mostrandoSugestoes, setMostrandoSugestoes] = useState(false)
  const [salvou, setSalvou] = useState(false)

  const [editandoEstadia, setEditandoEstadia] = useState(false)
  const [editNome, setEditNome] = useState('')
  const [editHomens, setEditHomens] = useState(0)
  const [editMulheres, setEditMulheres] = useState(0)
  const [editCriancas, setEditCriancas] = useState(0)
  const [editDataInicio, setEditDataInicio] = useState('')
  const [editDataFim, setEditDataFim] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('estadias')
        .select('id, nome, homens, mulheres, criancas, numero_dias, dias')
        .eq('id', id)
        .single()
      if (data) setEstadia(data as Estadia)
    }
    carregar()
  }, [id])

  async function salvar(nova: Estadia) {
    await supabase.from('estadias').update({ dias: nova.dias }).eq('id', id)
    setEstadia(nova)
  }

  function handleChangeNome(v: string) {
    setNomePrato(v)
    setReceitaDaBase(false)
    setReceitaVeioDaIA(false)
  }

  function handleSelectReceita(nome: string, ings: IngPrato[], fromIA: boolean) {
    setNomePrato(nome)
    setIngredientes(ings)
    setReceitaDaBase(!fromIA)
    setReceitaVeioDaIA(fromIA)
  }

  function cancelarPrato() {
    setAdicionandoPrato(false); setNomePrato(''); setIngredientes([])
    setReceitaDaBase(false); setReceitaVeioDaIA(false)
  }

  async function buscarSugestoesIA() {
    if (!estadia) return
    setCarregandoIA(true)
    setMostrandoSugestoes(true)
    setSugestoesIA([])
    const diasJaPlaneados = estadia.dias.filter(d => d.pratos.length > 0).length
    const res = await fetch('/api/cardapio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homens: estadia.homens, mulheres: estadia.mulheres, criancas: estadia.criancas,
        numeroDias: estadia.numero_dias, diasJaPlaneados,
      }),
    })
    const json = await res.json()
    setSugestoesIA(json.sugestoes ?? [])
    setCarregandoIA(false)
  }

  function adicionarSugestao(sugestao: SugestaoIA) {
    if (!estadia) return
    const ingsEnriquecidos = sugestao.ingredientes.map(ing => {
      const local = buscarIngrediente(ing.nome)[0]
      return { ...ing, fc: local?.fatorCorrecao ?? 1.10, fcc: local?.fatorCoccao ?? 1.0 }
    })
    const novo = { id: Date.now().toString(), nome: sugestao.nome, ingredientes: ingsEnriquecidos }
    const nova = { ...estadia, dias: estadia.dias.map((d, i) => i === diaAtivo ? { ...d, pratos: [...d.pratos, novo] } : d) }
    salvar(nova)
    setMostrandoSugestoes(false)
    setSugestoesIA([])
    setSalvou(true); setTimeout(() => setSalvou(false), 2000)
  }

  function abrirEditar() {
    if (!estadia) return
    setEditNome(estadia.nome)
    setEditHomens(estadia.homens)
    setEditMulheres(estadia.mulheres)
    setEditCriancas(estadia.criancas)
    setEditDataInicio(estadia.data_inicio ?? '')
    setEditDataFim(estadia.data_fim ?? '')
    setEditandoEstadia(true)
  }

  async function salvarEdicao() {
    if (!estadia || !editNome) return
    const numeroDias = editDataInicio && editDataFim
      ? Math.max(1, Math.round((new Date(editDataFim + 'T12:00:00').getTime() - new Date(editDataInicio + 'T12:00:00').getTime()) / 86400000) + 1)
      : estadia.numero_dias

    let diasNovos = estadia.dias
    if (editDataInicio && editDataFim && (editDataInicio !== estadia.data_inicio || editDataFim !== estadia.data_fim)) {
      const gerados = gerarDias(editDataInicio, editDataFim)
      diasNovos = gerados.map((d, i) => ({
        ...d,
        pratos: estadia.dias[i]?.pratos ?? [],
        extrasHomens: estadia.dias[i]?.extrasHomens ?? 0,
        extrasMulheres: estadia.dias[i]?.extrasMulheres ?? 0,
        extrasCriancas: estadia.dias[i]?.extrasCriancas ?? 0,
      }))
    }

    const atualizada: Estadia = {
      ...estadia,
      nome: editNome,
      homens: editHomens,
      mulheres: editMulheres,
      criancas: editCriancas,
      numero_dias: numeroDias,
      data_inicio: editDataInicio || undefined,
      data_fim: editDataFim || undefined,
      dias: diasNovos,
    }

    await supabase.from('estadias').update({
      nome: editNome,
      homens: editHomens,
      mulheres: editMulheres,
      criancas: editCriancas,
      numero_dias: numeroDias,
      data_inicio: editDataInicio || null,
      data_fim: editDataFim || null,
      dias: diasNovos,
    }).eq('id', estadia.id)

    setEstadia(atualizada)
    setEditandoEstadia(false)
  }

  function removerIngrediente(idx: number) {
    setIngredientes(prev => prev.filter((_, i) => i !== idx))
  }

  function ajustarGramas(idx: number, delta: number) {
    setIngredientes(prev => prev.map((ing, i) =>
      i === idx ? { ...ing, gramasPorPessoa: Math.max(5, ing.gramasPorPessoa + delta) } : ing
    ))
  }

  function salvarPrato() {
    if (!nomePrato || ingredientes.length === 0 || !estadia) return
    const novo: Prato = { id: Date.now().toString(), nome: nomePrato, ingredientes }
    const nova = { ...estadia, dias: estadia.dias.map((d, i) => i === diaAtivo ? { ...d, pratos: [...d.pratos, novo] } : d) }
    salvar(nova)
    cancelarPrato()
    setSalvou(true); setTimeout(() => setSalvou(false), 2000)
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

  if (!estadia) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F0F7F2' }}>
      <p style={{ color: '#5A7A68' }}>Carregando...</p>
    </div>
  )

  const totalRefeicoes = estadia.dias.reduce((sum, d) => sum + d.pratos.length, 0)
  const dia = estadia.dias[diaAtivo]
  const hospedesTotais = somarHospedes(
    { homens: estadia.homens, mulheres: estadia.mulheres, criancas: estadia.criancas },
    { homens: dia.extrasHomens, mulheres: dia.extrasMulheres, criancas: dia.extrasCriancas }
  )
  const equiv = totalEquivalente(hospedesTotais)
  const totalPessoas = hospedesTotais.homens + hospedesTotais.mulheres + hospedesTotais.criancas

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>

      {salvou && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg"
          style={{ background: '#128C7E', color: '#fff' }}>
          Refeição salva
        </div>
      )}

      {/* Cabeçalho */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-5">
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: '#128C7E' }}>← Voltar</Link>
          <button onClick={abrirEditar} className="text-sm font-medium" style={{ color: '#7BA892' }}>Editar</button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate" style={{ color: '#1A2E25' }}>{estadia.nome}</h1>
            <p className="text-sm mt-1" style={{ color: '#5A7A68' }}>
              {estadia.homens + estadia.mulheres + estadia.criancas} hóspedes · {estadia.numero_dias} dias
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link href={`/estadia/${id}/lista`}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-center"
              style={{ background: '#128C7E', color: '#fff' }}>
              Lista de compras
            </Link>
            <button onClick={buscarSugestoesIA}
              className="px-4 py-2 rounded-2xl text-xs font-semibold text-center"
              style={{ border: '1.5px solid #128C7E', color: '#128C7E', background: '#fff' }}>
              Sugerir cardápio
            </button>
          </div>
        </div>
      </div>

      {/* Seletor de dias */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {estadia.dias.map((d, i) => (
          <button key={i} onClick={() => { setDiaAtivo(i); cancelarPrato() }}
            className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium"
            style={diaAtivo === i
              ? { background: '#128C7E', color: '#fff' }
              : { background: '#fff', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
            {d.label}
            {d.pratos.length > 0 && (
              <span className="ml-1.5 w-4 h-4 rounded-full text-xs inline-flex items-center justify-center"
                style={{ background: diaAtivo === i ? 'rgba(255,255,255,0.25)' : '#E4F2EA', color: diaAtivo === i ? '#fff' : '#7BA892' }}>
                {d.pratos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-4 pb-10">
        {/* Convidados extras */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <p className="font-semibold text-sm mb-4" style={{ color: '#1A2E25' }}>
            Convidados extras · {totalPessoas} pessoas no total
          </p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { label: 'Homens', campo: 'extrasHomens' as const, val: dia.extrasHomens },
              { label: 'Mulheres', campo: 'extrasMulheres' as const, val: dia.extrasMulheres },
              { label: 'Crianças', campo: 'extrasCriancas' as const, val: dia.extrasCriancas },
            ]).map(({ label, campo, val }) => (
              <div key={campo} className="text-center">
                <p className="text-xs mb-2" style={{ color: '#5A7A68' }}>{label}</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => atualizarExtras(campo, val - 1)}
                    className="w-8 h-8 rounded-full text-sm"
                    style={{ border: '1.5px solid #C8E4D4', background: '#fff', color: '#1A2E25' }}>−</button>
                  <span className="font-semibold w-5 text-center text-sm" style={{ color: '#1A2E25' }}>{val}</span>
                  <button onClick={() => atualizarExtras(campo, val + 1)}
                    className="w-8 h-8 rounded-full text-sm"
                    style={{ background: '#128C7E', color: '#fff' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cardápio do dia */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-base" style={{ color: '#1A2E25' }}>Cardápio do dia</p>
          {dia.pratos.length > 0 && !adicionandoPrato && (
            <button onClick={() => setAdicionandoPrato(true)}
              className="text-sm font-semibold px-4 py-2 rounded-xl"
              style={{ background: '#128C7E', color: '#fff' }}>
              + Refeição
            </button>
          )}
        </div>

        {/* Refeições salvas */}
        {dia.pratos.map(prato => (
          <div key={prato.id} className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold" style={{ color: '#1A2E25' }}>{prato.nome}</p>
              <button onClick={() => removerPrato(prato.id)} className="text-lg px-1" style={{ color: '#7BA892' }}>×</button>
            </div>
            <div className="space-y-1">
              {prato.ingredientes.map((ing, i) => {
                const bruto = (ing.gramasPorPessoa / 1000) * ing.fc * equiv
                return (
                  <div key={i} className="flex justify-between items-center text-sm py-1.5"
                    style={{ borderBottom: i < prato.ingredientes.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                    <span style={{ color: '#5A7A68' }}>{ing.nome}</span>
                    <span className="font-medium" style={{ color: '#1A2E25' }}>{formatarPeso(bruto)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Formulário nova refeição */}
        {adicionandoPrato ? (
          <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #128C7E' }}>
            <p className="font-semibold mb-4" style={{ color: '#1A2E25' }}>Nova refeição</p>

            <InputReceita
              onChange={handleChangeNome}
              onSelect={handleSelectReceita}
              hospedes={estadia}
            />

            {(receitaDaBase || receitaVeioDaIA) && ingredientes.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: '#E8F5EE' }}>
                <span className="text-xs font-medium flex-1" style={{ color: '#1A2E25' }}>
                  {receitaVeioDaIA ? 'Ingredientes identificados pela IA' : `${ingredientes.length} ingredientes carregados da base`}
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
                      <button onClick={() => removerIngrediente(i)} className="ml-1 text-base px-1" style={{ color: '#7BA892' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <InputIngrediente onAdicionar={ing => setIngredientes(prev => [...prev, ing])} receitaNome={nomePrato || undefined} />

            <div className="flex gap-3 mt-4">
              <button onClick={cancelarPrato}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ border: '1.5px solid #C8E4D4', color: '#5A7A68', background: '#fff' }}>
                Cancelar
              </button>
              <button onClick={salvarPrato} disabled={!nomePrato || ingredientes.length === 0}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                style={{ background: '#128C7E', color: '#fff' }}>
                Salvar refeição
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdicionandoPrato(true)}
            className="w-full py-4 rounded-3xl text-sm font-semibold"
            style={{ border: '1.5px dashed #C8E4D4', color: '#128C7E', background: '#fff' }}>
            + Adicionar refeição ao cardápio
          </button>
        )}

        {!adicionandoPrato && (
          <div className="flex gap-3 pt-2 pb-2">
            <Link href="/dashboard"
              className="px-5 py-4 rounded-2xl font-semibold text-sm"
              style={{ border: '1.5px solid #C8E4D4', color: '#5A7A68', background: '#fff' }}>
              ← Início
            </Link>
            {totalRefeicoes > 0 && (
              <Link href={`/estadia/${id}/lista`}
                className="flex-1 py-4 rounded-2xl font-semibold text-sm text-center"
                style={{ background: '#128C7E', color: '#fff' }}>
                Gerar lista de compras
              </Link>
            )}
          </div>
        )}
      </div>

      {mostrandoSugestoes && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(26,46,37,0.5)' }}
          onClick={() => { if (!carregandoIA) { setMostrandoSugestoes(false); setSugestoesIA([]) } }}>
          <div className="mt-auto rounded-t-3xl max-h-[80vh] overflow-y-auto"
            style={{ background: '#F0F7F2' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0" style={{ background: '#F0F7F2' }}>
              <div>
                <p className="font-bold text-base" style={{ color: '#1A2E25' }}>Sugestões de cardápio</p>
                <p className="text-xs mt-0.5" style={{ color: '#5A7A68' }}>Toque para adicionar ao dia selecionado</p>
              </div>
              <button onClick={() => { setMostrandoSugestoes(false); setSugestoesIA([]) }}
                className="text-2xl leading-none" style={{ color: '#5A7A68' }}>×</button>
            </div>

            {carregandoIA ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#128C7E', borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: '#5A7A68' }}>Montando cardápio para o grupo...</p>
              </div>
            ) : (
              <div className="px-5 pb-8 space-y-3">
                {sugestoesIA.map((s, i) => (
                  <button key={i} onClick={() => adicionarSugestao(s)}
                    className="w-full text-left p-4 rounded-3xl"
                    style={{ background: '#fff', border: '1.5px solid #D4EDE0' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: '#1A2E25' }}>{s.nome}</p>
                        <p className="text-xs mt-1" style={{ color: '#7BA892' }}>
                          {s.ingredientes.map(i => i.nome).join(', ')}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl flex-shrink-0"
                        style={{ background: '#E8F5EE', color: '#128C7E' }}>
                        + Adicionar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editandoEstadia && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(26,46,37,0.5)' }}
          onClick={() => setEditandoEstadia(false)}>
          <div className="mt-auto rounded-t-3xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#F0F7F2' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0" style={{ background: '#F0F7F2' }}>
              <p className="font-bold text-base" style={{ color: '#1A2E25' }}>Editar estadia</p>
              <button onClick={() => setEditandoEstadia(false)} className="text-2xl leading-none" style={{ color: '#5A7A68' }}>×</button>
            </div>

            <div className="px-5 pb-8 space-y-4">
              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>Nome</label>
                <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-base outline-none"
                  style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
              </div>

              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
                <p className="font-medium text-sm mb-4" style={{ color: '#1A2E25' }}>Período</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#7BA892' }}>Check-in</label>
                    <input type="date" value={editDataInicio}
                      onChange={e => { setEditDataInicio(e.target.value); if (editDataFim && e.target.value > editDataFim) setEditDataFim('') }}
                      className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
                      style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#7BA892' }}>Check-out</label>
                    <input type="date" value={editDataFim} min={editDataInicio}
                      onChange={e => setEditDataFim(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border text-sm outline-none"
                      style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
                  </div>
                </div>
                {editDataInicio && editDataFim && editDataInicio !== estadia.data_inicio && (
                  <p className="text-xs mt-3 px-3 py-2 rounded-xl" style={{ background: '#FEF9E7', color: '#92610A' }}>
                    As datas serão atualizadas. Refeições existentes são mantidas por posição do dia.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
                <p className="font-medium text-sm mb-4" style={{ color: '#1A2E25' }}>Hóspedes</p>
                {([
                  { label: 'Homens', val: editHomens, set: setEditHomens },
                  { label: 'Mulheres', val: editMulheres, set: setEditMulheres },
                  { label: 'Crianças', val: editCriancas, set: setEditCriancas },
                ] as const).map(({ label, val, set }) => (
                  <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #E4F2EA' }}>
                    <p className="text-sm font-medium" style={{ color: '#1A2E25' }}>{label}</p>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => set(Math.max(0, val - 1))}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                        style={{ border: '1.5px solid #C8E4D4', color: '#1A2E25', background: '#fff' }}>−</button>
                      <span className="w-6 text-center font-semibold" style={{ color: '#1A2E25' }}>{val}</span>
                      <button type="button" onClick={() => set(val + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                        style={{ background: '#128C7E', color: '#fff' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditandoEstadia(false)}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold"
                  style={{ border: '1.5px solid #D4EDE0', color: '#5A7A68', background: '#fff' }}>
                  Cancelar
                </button>
                <button onClick={salvarEdicao} disabled={!editNome}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: '#128C7E', color: '#fff' }}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
