'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
import { buscarReceita, resolverReceita, type Receita } from '@/lib/receitas-db'
import { totalEquivalente } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; fcc: number; categoria: string }
interface Refeicao { id: string; nome: string; ingredientes: IngPrato[] }
interface Evento { id: string; nome: string; data?: string; homens: number; mulheres: number; criancas: number; totalPessoas: number; refeicoes: Refeicao[] }

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
  const [adicionando, setAdicionando] = useState(false)
  const [nomeRefeicao, setNomeRefeicao] = useState('')
  const [ingredientes, setIngredientes] = useState<IngPrato[]>([])
  const [sugestoesReceita, setSugestoesReceita] = useState<Receita[]>([])
  const [receitaDaBase, setReceitaDaBase] = useState(false)

  useEffect(() => {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const found = eventos.find((e: Evento) => e.id === id)
    if (found) setEvento(found)
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

  function removerIngrediente(idx: number) {
    setIngredientes(prev => prev.filter((_, i) => i !== idx))
  }

  if (!evento) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F0F7F2' }}>
      <p style={{ color: '#5A7A68' }}>Carregando...</p>
    </div>
  )

  const equiv = totalEquivalente({ homens: evento.homens, mulheres: evento.mulheres, criancas: evento.criancas })

  return (
    <main className="min-h-screen max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#128C7E' }}>← Dashboard</Link>
          <Link href={`/receita/${id}/lista`}
            className="px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#128C7E', color: '#fff' }}>
            Lista de compras 🛒
          </Link>
        </div>
        <h1 className="text-xl font-bold mb-0.5" style={{ color: '#1A2E25' }}>{evento.nome}</h1>
        <p className="text-sm" style={{ color: '#5A7A68' }}>
          {evento.totalPessoas} pessoas
          {evento.data && ` · ${new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
        </p>
      </div>

      <div className="px-5 space-y-4 pb-10">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-base" style={{ color: '#1A2E25' }}>Cardápio</p>
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
                    <span className="font-medium" style={{ color: '#1A2E25' }}>{formatarPeso(bruto)}</span>
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
                      <button onClick={() => removerIngrediente(i)} className="ml-1 text-base px-1" style={{ color: '#7BA892' }}>×</button>
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
      </div>
    </main>
  )
}
