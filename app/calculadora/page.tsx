'use client'
import { useState } from 'react'
import Link from 'next/link'
import { buscarIngrediente, type Ingrediente } from '@/lib/ingredientes-db'
import { calcularReceita, formatarPeso, formatarMoeda, type IngredienteReceita, type ResultadoCenario } from '@/lib/calculadora'
import type { CenarioNome } from '@/lib/fatores-correcao'

type Etapa = 'configurar' | 'ingredientes' | 'resultado'

function BuscaIngrediente({ onAdicionar }: { onAdicionar: (ing: IngredienteReceita) => void }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<Ingrediente[]>([])
  const [selecionado, setSelecionado] = useState<Ingrediente | null>(null)
  const [preco, setPreco] = useState('')
  const [qtd, setQtd] = useState('')

  function buscar(v: string) {
    setTermo(v)
    setSelecionado(null)
    setSugestoes(v.length >= 2 ? buscarIngrediente(v) : [])
  }

  function selecionar(ing: Ingrediente) {
    setSelecionado(ing)
    setTermo(ing.nome)
    setQtd(String((ing.percapitaGramas / 1000).toFixed(3)))
    setSugestoes([])
  }

  function confirmar() {
    if (!selecionado || !preco || !qtd) return
    onAdicionar({
      id: Date.now().toString(),
      nome: selecionado.nome,
      quantidadeLiquidaKg: parseFloat(qtd),
      precoUnitario: parseFloat(preco),
      fatorCorrecao: selecionado.fatorCorrecao,
      fatorCoccao: selecionado.fatorCoccao,
      categoria: selecionado.categoria,
    })
    setTermo(''); setSelecionado(null); setPreco(''); setQtd('')
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text" value={termo} onChange={e => buscar(e.target.value)}
          placeholder="Buscar ingrediente..."
          className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
          style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}
        />
        {sugestoes.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden"
            style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
            {sugestoes.map(s => (
              <button key={s.nome} onClick={() => selecionar(s)}
                className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                style={{ borderBottom: '1px solid #3A2E22', color: '#F2EBE0' }}>
                <span>{s.nome}</span>
                <span className="text-xs" style={{ color: '#9B8B7A' }}>{s.percapitaGramas}g/pessoa</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#2A2118' }}>
          <p className="text-sm font-semibold" style={{ color: '#F2EBE0' }}>{selecionado.nome}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Qtd. na receita (kg)</label>
              <input
                type="number" value={qtd} onChange={e => setQtd(e.target.value)}
                step="0.05" min="0" placeholder="0.000"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-center font-semibold"
                style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9B8B7A' }}>Preço por kg (R$)</label>
              <input
                type="number" value={preco} onChange={e => setPreco(e.target.value)}
                step="0.01" min="0" placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-center font-semibold"
                style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}
              />
            </div>
          </div>
          <button onClick={confirmar} disabled={!preco || !qtd}
            className="w-full py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
            style={{ background: '#C4823A', color: '#fff' }}>
            Adicionar
          </button>
        </div>
      )}
    </div>
  )
}

export default function CalculadoraPage() {
  const [etapa, setEtapa] = useState<Etapa>('configurar')
  const [nomeReceita, setNomeReceita] = useState('')
  const [numeroPessoas, setNumeroPessoas] = useState(10)
  const [porcoes, setPorcoes] = useState(4)
  const [markup, setMarkup] = useState(3)
  const [ingredientes, setIngredientes] = useState<IngredienteReceita[]>([])
  const [resultado, setResultado] = useState<Record<CenarioNome, ResultadoCenario> | null>(null)
  const [cenarioAtivo, setCenarioAtivo] = useState<CenarioNome>('moderado')

  function removerIngrediente(id: string) {
    setIngredientes(prev => prev.filter(i => i.id !== id))
  }

  function calcular() {
    if (ingredientes.length === 0) return
    const res = calcularReceita(
      { nome: nomeReceita, porcoes, ingredientes, markupPersonalizado: markup },
      numeroPessoas
    )
    setResultado(res)
    setEtapa('resultado')
  }

  // ─── RESULTADO ────────────────────────────────────────────
  if (etapa === 'resultado' && resultado) {
    const cenario = resultado[cenarioAtivo]
    const cenarios: { key: CenarioNome; label: string }[] = [
      { key: 'conservador', label: 'Conservador' },
      { key: 'moderado', label: 'Moderado' },
      { key: 'agressivo', label: 'Agressivo' },
    ]

    return (
      <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#1C1712' }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setEtapa('ingredientes')} className="text-sm font-medium underline" style={{ color: '#C4823A' }}>← Ingredientes</button>
          <span className="text-sm" style={{ color: '#9B8B7A' }}>{numeroPessoas} pessoas</span>
        </div>

        <h1 className="text-xl font-bold mb-1" style={{ color: '#F2EBE0' }}>{nomeReceita || 'Resultado'}</h1>
        <p className="text-sm mb-5" style={{ color: '#9B8B7A' }}>Escolha o cenário de consumo</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {cenarios.map(c => (
            <button key={c.key} onClick={() => setCenarioAtivo(c.key)}
              className="py-3 rounded-2xl text-sm font-semibold"
              style={cenarioAtivo === c.key
                ? { background: '#C4823A', color: '#fff' }
                : { background: '#252015', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl p-5 mb-4" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs mb-1" style={{ color: '#9B8B7A' }}>Custo total</p>
              <p className="font-bold text-base" style={{ color: '#F2EBE0' }}>{formatarMoeda(cenario.custoTotalReceita)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#9B8B7A' }}>Por pessoa</p>
              <p className="font-bold text-base" style={{ color: '#F2EBE0' }}>{formatarMoeda(cenario.custoPorPessoa)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#9B8B7A' }}>Preço sugerido</p>
              <p className="font-bold text-base" style={{ color: '#C4823A' }}>{formatarMoeda(cenario.precoVendaSugerido)}</p>
            </div>
          </div>
        </div>

        <p className="font-semibold text-sm mb-3" style={{ color: '#F2EBE0' }}>Ingredientes calculados</p>
        <div className="space-y-3 mb-5">
          {cenario.ingredientes.map((ing, i) => (
            <div key={i} className="rounded-3xl p-4" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-sm" style={{ color: '#F2EBE0' }}>{ing.nome}</p>
                <p className="font-semibold text-sm" style={{ color: '#9B8B7A' }}>{formatarMoeda(ing.custoTotal)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Comprar', val: formatarPeso(ing.pesoBrutoTotal) },
                  { label: 'Líquido', val: formatarPeso(ing.pesoLiquidoTotal) },
                  { label: 'Cozido', val: formatarPeso(ing.pesoPoscoccaoTotal) },
                ].map(({ label, val }) => (
                  <div key={label} className="py-2 rounded-xl" style={{ background: '#1C1712' }}>
                    <p className="text-xs mb-0.5" style={{ color: '#9B8B7A' }}>{label}</p>
                    <p className="font-bold text-xs" style={{ color: '#F2EBE0' }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-5 mb-6" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>Comparativo</p>
          <div className="space-y-2">
            {cenarios.map(c => (
              <div key={c.key} className="flex justify-between text-sm">
                <span style={{ color: '#9B8B7A' }}>{c.label} ({resultado[c.key].label})</span>
                <span className="font-semibold" style={{ color: '#F2EBE0' }}>
                  custo {formatarMoeda(resultado[c.key].custoTotalReceita)} · venda {formatarMoeda(resultado[c.key].precoVendaSugerido * numeroPessoas)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setEtapa('configurar'); setResultado(null); setIngredientes([]) }}
          className="w-full py-4 rounded-2xl font-semibold text-sm"
          style={{ border: '1.5px solid #3A2E22', color: '#C4823A', background: '#252015' }}>
          Nova calculadora
        </button>
        <div className="h-8" />
      </main>
    )
  }

  // ─── INGREDIENTES ─────────────────────────────────────────
  if (etapa === 'ingredientes') {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#1C1712' }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setEtapa('configurar')} className="text-sm font-medium underline" style={{ color: '#C4823A' }}>← Voltar</button>
          <span className="text-sm" style={{ color: '#9B8B7A' }}>{nomeReceita} · {numeroPessoas}p</span>
        </div>

        <h1 className="text-xl font-bold mb-1" style={{ color: '#F2EBE0' }}>Ingredientes</h1>
        <p className="text-sm mb-6" style={{ color: '#9B8B7A' }}>Adicione os ingredientes da receita</p>

        <div className="rounded-3xl p-5 mb-4" style={{ background: '#252015', border: '1.5px solid #C4823A' }}>
          <p className="font-semibold text-sm mb-4" style={{ color: '#F2EBE0' }}>Adicionar ingrediente</p>
          <BuscaIngrediente onAdicionar={ing => setIngredientes(prev => [...prev, ing])} />
        </div>

        {ingredientes.length > 0 && (
          <div className="space-y-2 mb-6">
            <p className="font-semibold text-sm" style={{ color: '#F2EBE0' }}>Adicionados ({ingredientes.length})</p>
            {ingredientes.map(ing => (
              <div key={ing.id} className="rounded-2xl px-4 py-3 flex items-center justify-between"
                style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#F2EBE0' }}>{ing.nome}</p>
                  <p className="text-xs" style={{ color: '#9B8B7A' }}>
                    {(ing.quantidadeLiquidaKg * 1000).toFixed(0)}g · R${ing.precoUnitario.toFixed(2)}/kg
                  </p>
                </div>
                <button onClick={() => removerIngrediente(ing.id)} className="text-lg px-1" style={{ color: '#9B8B7A' }}>×</button>
              </div>
            ))}
          </div>
        )}

        <button onClick={calcular} disabled={ingredientes.length === 0}
          className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
          style={{ background: '#C4823A', color: '#fff' }}>
          Calcular →
        </button>
        <div className="h-8" />
      </main>
    )
  }

  // ─── CONFIGURAR ───────────────────────────────────────────
  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#1C1712' }}>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-medium underline" style={{ color: '#C4823A' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#F2EBE0' }}>Calculadora de receita</h1>
      <p className="text-sm mb-8" style={{ color: '#9B8B7A' }}>Custo, markup e preço de venda por pessoa</p>

      <div className="space-y-4">
        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#F2EBE0' }}>Nome da receita</label>
          <input type="text" value={nomeReceita} onChange={e => setNomeReceita(e.target.value)}
            placeholder="Ex: Moqueca de camarão, Frango assado"
            className="w-full px-4 py-3 rounded-2xl text-base outline-none"
            style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }} />
        </div>

        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-sm" style={{ color: '#F2EBE0' }}>Número de pessoas</p>
            <span className="font-bold text-lg" style={{ color: '#C4823A' }}>{numeroPessoas}</span>
          </div>
          <input type="range" min="1" max="200" value={numeroPessoas}
            onChange={e => setNumeroPessoas(parseInt(e.target.value))}
            className="w-full" style={{ accentColor: '#C4823A' }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#9B8B7A' }}>
            <span>1</span><span>100</span><span>200</span>
          </div>
        </div>

        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-sm" style={{ color: '#F2EBE0' }}>Porções da receita original</p>
            <span className="font-bold text-lg" style={{ color: '#C4823A' }}>{porcoes}</span>
          </div>
          <p className="text-xs mb-4" style={{ color: '#9B8B7A' }}>Para quantas pessoas a receita foi escrita?</p>
          <input type="range" min="1" max="50" value={porcoes}
            onChange={e => setPorcoes(parseInt(e.target.value))}
            className="w-full" style={{ accentColor: '#C4823A' }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#9B8B7A' }}>
            <span>1</span><span>25</span><span>50</span>
          </div>
        </div>

        <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
          <p className="font-medium text-sm mb-3" style={{ color: '#F2EBE0' }}>Markup</p>
          <div className="grid grid-cols-4 gap-2">
            {[2, 2.5, 3, 3.5].map(m => (
              <button key={m} onClick={() => setMarkup(m)}
                className="py-3 rounded-2xl text-sm font-bold"
                style={markup === m
                  ? { background: '#C4823A', color: '#fff' }
                  : { background: '#1C1712', color: '#9B8B7A', border: '1.5px solid #3A2E22' }}>
                {m}×
              </button>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: '#9B8B7A' }}>
            Food cost: {Math.round(100 / markup)}% · Recomendado: 3× ({Math.round(100 / 3)}% food cost)
          </p>
        </div>
      </div>

      <button onClick={() => setEtapa('ingredientes')} disabled={!nomeReceita}
        className="w-full mt-6 py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#C4823A', color: '#fff' }}>
        Próximo: Ingredientes →
      </button>
      <div className="h-8" />
    </main>
  )
}
