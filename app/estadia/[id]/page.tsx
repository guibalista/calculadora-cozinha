'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, buscarIngredienteIA, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, type Receita } from '@/lib/receitas-db'
import { totalEquivalente, somarHospedes } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; fcc: number; categoria: string }
interface Prato { id: string; nome: string; ingredientes: IngPrato[] }
interface Dia { indice: number; label: string; pratos: Prato[]; extrasHomens: number; extrasMulheres: number; extrasCriancas: number }
interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numeroDias: number; dias: Dia[] }

function InputIngrediente({ onAdicionar }: { onAdicionar: (ing: IngPrato) => void }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<Ingrediente[]>([])
  const [selecionado, setSelecionado] = useState<Ingrediente | null>(null)
  const [gramas, setGramas] = useState('')
  const [buscandoIA, setBuscandoIA] = useState(false)
  const [veioDaIA, setVeioDaIA] = useState(false)
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null }

  function buscar(v: string) {
    setTermo(v)
    setSelecionado(null)
    setVeioDaIA(false)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (v.length < 2) { setSugestoes([]); return }

    const locais = buscarIngrediente(v)
    setSugestoes(locais)

    if (locais.length === 0) {
      timerRef.current = setTimeout(async () => {
        setBuscandoIA(true)
        const ing = await buscarIngredienteIA(v)
        setSugestoes([ing])
        setVeioDaIA(true)
        setBuscandoIA(false)
      }, 600)
    }
  }

  function selecionar(ing: Ingrediente) {
    setSelecionado(ing); setTermo(ing.nome); setGramas(String(ing.percapitaGramas)); setSugestoes([])
  }
  function confirmar() {
    if (!selecionado || !gramas) return
    onAdicionar({ nome: selecionado.nome, gramasPorPessoa: parseFloat(gramas), fc: selecionado.fatorCorrecao, fcc: selecionado.fatorCoccao, categoria: selecionado.categoria })
    setTermo(''); setSelecionado(null); setGramas(''); setVeioDaIA(false)
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
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: '#E8F5EE' }}>
          <span className="flex-1 text-sm font-medium truncate" style={{ color: '#1A2E25' }}>{selecionado.nome}</span>
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

export default function EstadiaPage() {
  const { id } = useParams<{ id: string }>()
  const [estadia, setEstadia] = useState<Estadia | null>(null)
  const [diaAtivo, setDiaAtivo] = useState(0)

  const [adicionandoPrato, setAdicionandoPrato] = useState(false)
  const [nomePrato, setNomePrato] = useState('')
  const [ingredientes, setIngredientes] = useState<IngPrato[]>([])
  const [sugestoesReceita, setSugestoesReceita] = useState<Receita[]>([])
  const [receitaDaBase, setReceitaDaBase] = useState(false)

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

  function handleNomePrato(v: string) {
    setNomePrato(v)
    setReceitaDaBase(false)
    setSugestoesReceita(v.length >= 2 ? buscarReceita(v) : [])
  }

  function selecionarReceita(receita: Receita) {
    setNomePrato(receita.nome)
    setIngredientes(resolverReceita(receita))
    setReceitaDaBase(true)
    setSugestoesReceita([])
  }

  function cancelarPrato() {
    setAdicionandoPrato(false); setNomePrato(''); setIngredientes([])
    setReceitaDaBase(false); setSugestoesReceita([])
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
      {/* Cabeçalho */}
      <div className="px-5 pt-8 pb-4">
        <Link href="/dashboard" className="text-sm font-medium block mb-5" style={{ color: '#128C7E' }}>← Voltar</Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate" style={{ color: '#1A2E25' }}>{estadia.nome}</h1>
            <p className="text-sm mt-1" style={{ color: '#5A7A68' }}>
              {estadia.homens + estadia.mulheres + estadia.criancas} hóspedes · {estadia.numeroDias} dias
            </p>
          </div>
          <Link href={`/estadia/${id}/lista`}
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#128C7E', color: '#fff' }}>
            Lista de compras
          </Link>
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

            <div className="mb-4 relative">
              <input type="text" value={nomePrato} onChange={e => handleNomePrato(e.target.value)}
                placeholder="Nome da refeição (ex: Feijoada, Frango assado...)"
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
                      <button onClick={() => removerIngrediente(i)} className="ml-1 text-base px-1" style={{ color: '#7BA892' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <InputIngrediente onAdicionar={ing => setIngredientes(prev => [...prev, ing])} />

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
    </main>
  )
}
