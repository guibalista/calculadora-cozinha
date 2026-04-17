'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
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
  const ref = useRef<HTMLDivElement>(null)

  function buscar(v: string) {
    setTermo(v)
    setSelecionado(null)
    setSugestoes(v.length >= 2 ? buscarIngrediente(v) : [])
  }

  function selecionar(ing: Ingrediente) {
    setSelecionado(ing)
    setTermo(ing.nome)
    setGramas(String(ing.percapitaGramas))
    setSugestoes([])
  }

  function confirmar() {
    if (!selecionado || !gramas) return
    onAdicionar({
      nome: selecionado.nome,
      gramasPorPessoa: parseFloat(gramas),
      fc: selecionado.fatorCorrecao,
      fcc: selecionado.fatorCoccao,
      categoria: selecionado.categoria,
    })
    setTermo(''); setSelecionado(null); setGramas('')
  }

  return (
    <div ref={ref} className="space-y-2">
      <div className="relative">
        <input
          type="text" value={termo} onChange={e => buscar(e.target.value)}
          placeholder="Digite o ingrediente..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }}
        />
        {sugestoes.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
            style={{ background: '#fff', border: '1.5px solid #EBEBEB' }}>
            {sugestoes.map(s => (
              <button key={s.nome} onClick={() => selecionar(s)}
                className="w-full text-left px-4 py-3 text-sm flex items-center justify-between active:opacity-60"
                style={{ borderBottom: '1px solid #F0EEEB', color: '#222' }}>
                <span>{s.nome}</span>
                <span className="text-xs" style={{ color: '#9B8B7A' }}>{s.percapitaGramas}g/pessoa</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: '#F0EEEB' }}>
          <span className="flex-1 text-sm font-medium" style={{ color: '#222' }}>{selecionado.nome}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setGramas(v => String(Math.max(10, parseFloat(v || '0') - 10)))}
              className="w-7 h-7 rounded-full text-sm flex items-center justify-center"
              style={{ border: '1.5px solid #DDDDDD', background: '#fff' }}>−</button>
            <div className="flex items-center gap-0.5">
              <input type="number" value={gramas} onChange={e => setGramas(e.target.value)}
                className="w-14 text-center text-sm font-semibold outline-none bg-transparent"
                style={{ color: '#222' }} />
              <span className="text-xs" style={{ color: '#9B8B7A' }}>g</span>
            </div>
            <button onClick={() => setGramas(v => String(parseFloat(v || '0') + 10))}
              className="w-7 h-7 rounded-full text-sm flex items-center justify-center"
              style={{ border: '1.5px solid #222', background: '#222', color: '#fff' }}>+</button>
          </div>
          <button onClick={confirmar}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: '#222', color: '#fff' }}>
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
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#222' }}>← Estadias</Link>
          <Link href={`/estadia/${id}/lista`}
            className="px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#222', color: '#fff' }}>
            Lista de compras 🛒
          </Link>
        </div>
        <h1 className="text-xl font-bold mb-0.5" style={{ color: '#222' }}>{estadia.nome}</h1>
        <p className="text-sm" style={{ color: '#717171' }}>
          {estadia.homens + estadia.mulheres + estadia.criancas} hóspedes · {estadia.numeroDias} dias
        </p>
      </div>

      {/* Seletor de dias */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto">
        {estadia.dias.map((d, i) => (
          <button key={i} onClick={() => setDiaAtivo(i)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all"
            style={diaAtivo === i
              ? { background: '#222', color: '#fff' }
              : { background: '#fff', color: '#717171', border: '1.5px solid #EBEBEB' }}>
            {d.label}
            {d.pratos.length > 0 && <span className="ml-1 w-4 h-4 rounded-full text-xs inline-flex items-center justify-center"
              style={{ background: diaAtivo === i ? 'rgba(255,255,255,0.3)' : '#F0EEEB', color: diaAtivo === i ? '#fff' : '#9B8B7A' }}>
              {d.pratos.length}
            </span>}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-4 pb-10">
        {/* Convidados extras */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #EBEBEB' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: '#222' }}>
            Convidados extras · {totalPessoas} pessoas no total
          </p>
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
                    className="w-7 h-7 rounded-full text-sm"
                    style={{ border: '1.5px solid #DDDDDD', background: '#fff', color: '#222' }}>−</button>
                  <span className="font-semibold w-4 text-center text-sm" style={{ color: '#222' }}>{val}</span>
                  <button onClick={() => atualizarExtras(campo, val + 1)}
                    className="w-7 h-7 rounded-full text-sm"
                    style={{ border: '1.5px solid #222', background: '#222', color: '#fff' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pratos */}
        <p className="font-semibold text-base" style={{ color: '#222' }}>Cardápio do dia</p>

        {dia.pratos.map(prato => (
          <div key={prato.id} className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #EBEBEB' }}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold" style={{ color: '#222' }}>{prato.nome}</p>
              <button onClick={() => removerPrato(prato.id)} className="text-lg px-1" style={{ color: '#BBBBBB' }}>×</button>
            </div>
            <div className="space-y-2">
              {prato.ingredientes.map((ing, i) => {
                const bruto = (ing.gramasPorPessoa / 1000) * ing.fc * equiv
                return (
                  <div key={i} className="flex justify-between items-center text-sm py-1"
                    style={{ borderBottom: i < prato.ingredientes.length - 1 ? '1px solid #F0EEEB' : 'none' }}>
                    <span style={{ color: '#717171' }}>{ing.nome}</span>
                    <span className="font-medium" style={{ color: '#222' }}>{formatarPeso(bruto)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {adicionandoPrato ? (
          <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #222' }}>
            <p className="font-semibold mb-4" style={{ color: '#222' }}>Novo prato</p>

            <div className="mb-4">
              <input type="text" value={nomePrato} onChange={e => setNomePrato(e.target.value)}
                placeholder="Nome do prato (ex: Feijoada, Frango assado)"
                className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                style={{ border: '1.5px solid #DDDDDD', background: '#F7F5F2', color: '#222' }} />
            </div>

            {ingredientes.length > 0 && (
              <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1.5px solid #EBEBEB' }}>
                {ingredientes.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < ingredientes.length - 1 ? '1px solid #F0EEEB' : 'none' }}>
                    <span className="text-sm flex-1" style={{ color: '#222' }}>{ing.nome}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => ajustarGramas(i, -10)}
                        className="w-6 h-6 rounded-full text-xs"
                        style={{ border: '1px solid #DDD', color: '#222', background: '#fff' }}>−</button>
                      <span className="text-sm font-medium w-10 text-center" style={{ color: '#222' }}>{ing.gramasPorPessoa}g</span>
                      <button onClick={() => ajustarGramas(i, 10)}
                        className="w-6 h-6 rounded-full text-xs"
                        style={{ border: '1px solid #222', background: '#222', color: '#fff' }}>+</button>
                      <button onClick={() => removerIngrediente(i)} className="ml-1 text-sm px-1" style={{ color: '#BBBBBB' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <InputIngrediente onAdicionar={ing => setIngredientes(prev => [...prev, ing])} />

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
            className="w-full py-4 rounded-3xl text-sm font-semibold"
            style={{ border: '1.5px dashed #DDDDDD', color: '#222', background: '#fff' }}>
            + Adicionar prato ao cardápio
          </button>
        )}
      </div>
    </main>
  )
}
