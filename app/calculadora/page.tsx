'use client'
import { useState } from 'react'
import Link from 'next/link'
import { tabelaAlimentos } from '@/lib/fatores-correcao'
import { calcularReceita, formatarPeso, formatarMoeda, type IngredienteReceita, type ResultadoCenario } from '@/lib/calculadora'
import type { CenarioNome } from '@/lib/fatores-correcao'

type Etapa = 'configurar' | 'ingredientes' | 'resultado'

export default function CalculadoraPage() {
  const [etapa, setEtapa] = useState<Etapa>('configurar')
  const [nomeReceita, setNomeReceita] = useState('')
  const [numeroPessoas, setNumeroPessoas] = useState(10)
  const [porcoes, setPorcoes] = useState(4)
  const [markup, setMarkup] = useState(3)
  const [ingredientes, setIngredientes] = useState<IngredienteReceita[]>([])
  const [resultado, setResultado] = useState<Record<CenarioNome, ResultadoCenario> | null>(null)
  const [cenarioAtivo, setCenarioAtivo] = useState<CenarioNome>('moderado')

  const [novoNome, setNovoNome] = useState('')
  const [novaQtd, setNovaQtd] = useState('')
  const [novoPreco, setNovoPreco] = useState('')
  const [novoFc, setNovoFc] = useState('1.00')
  const [novoFcoccao, setNovoFcoccao] = useState('0.80')

  function buscarFatores(nome: string) {
    const base = tabelaAlimentos.find(a => a.nome.toLowerCase().includes(nome.toLowerCase()))
    if (base) {
      setNovoFc(base.fatorCorrecao.toFixed(2))
      setNovoFcoccao(base.fatorCoccao.toFixed(2))
    }
  }

  function adicionarIngrediente() {
    if (!novoNome || !novaQtd || !novoPreco) return
    const novo: IngredienteReceita = {
      id: Date.now().toString(),
      nome: novoNome,
      quantidadeLiquidaKg: parseFloat(novaQtd),
      precoUnitario: parseFloat(novoPreco),
      fatorCorrecao: parseFloat(novoFc),
      fatorCoccao: parseFloat(novoFcoccao),
      categoria: tabelaAlimentos.find(a => a.nome.toLowerCase().includes(novoNome.toLowerCase()))?.categoria ?? 'proteina',
    }
    setIngredientes(prev => [...prev, novo])
    setNovoNome('')
    setNovaQtd('')
    setNovoPreco('')
    setNovoFc('1.00')
    setNovoFcoccao('0.80')
  }

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

  if (etapa === 'resultado' && resultado) {
    const cenario = resultado[cenarioAtivo]
    const cores: Record<CenarioNome, string> = {
      conservador: 'bg-blue-50 border-blue-200 text-blue-800',
      moderado: 'bg-green-50 border-green-200 text-green-800',
      agressivo: 'bg-orange-50 border-orange-200 text-orange-800',
    }
    const botoesAtivos: Record<CenarioNome, string> = {
      conservador: 'bg-blue-600 text-white',
      moderado: 'bg-green-600 text-white',
      agressivo: 'bg-orange-500 text-white',
    }

    return (
      <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEtapa('ingredientes')} className="text-[#c8783a] text-sm font-medium">← Voltar</button>
          <h1 className="text-xl font-bold text-[#1a1a1a] flex-1">{nomeReceita || 'Resultado'}</h1>
        </div>

        <p className="text-sm text-[#8a7f74] mb-4">Para <strong>{numeroPessoas} pessoas</strong> — escolha o cenário:</p>

        <div className="flex gap-2 mb-6">
          {(['conservador', 'moderado', 'agressivo'] as CenarioNome[]).map(c => (
            <button
              key={c}
              onClick={() => setCenarioAtivo(c)}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all border ${cenarioAtivo === c ? botoesAtivos[c] : 'bg-white border-[#e5e0d8] text-[#8a7f74]'}`}
            >
              {resultado[c].label}
            </button>
          ))}
        </div>

        <div className={`rounded-3xl p-5 border mb-6 ${cores[cenarioAtivo]}`}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs opacity-70 mb-1">Custo total</p>
              <p className="font-bold text-lg">{formatarMoeda(cenario.custoTotalReceita)}</p>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Custo/pessoa</p>
              <p className="font-bold text-lg">{formatarMoeda(cenario.custoPorPessoa)}</p>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Preço sugerido</p>
              <p className="font-bold text-lg">{formatarMoeda(cenario.precoVendaSugerido)}</p>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-[#1a1a1a] mb-3">Ingredientes ({cenario.ingredientes.length})</h2>

        <div className="space-y-3 mb-6">
          {cenario.ingredientes.map((ing, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-[#e5e0d8] shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-[#1a1a1a] text-sm">{ing.nome}</p>
                <p className="font-bold text-[#c8783a] text-sm">{formatarMoeda(ing.custoTotal)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#f9f7f4] rounded-xl p-2">
                  <p className="text-xs text-[#8a7f74] mb-1">Peso bruto</p>
                  <p className="font-bold text-xs text-[#1a1a1a]">{formatarPeso(ing.pesoBrutoTotal)}</p>
                  <p className="text-xs text-[#8a7f74]">{formatarPeso(ing.pesoBrutoPorPessoa)}/pessoa</p>
                </div>
                <div className="bg-[#f9f7f4] rounded-xl p-2">
                  <p className="text-xs text-[#8a7f74] mb-1">Peso líquido</p>
                  <p className="font-bold text-xs text-[#1a1a1a]">{formatarPeso(ing.pesoLiquidoTotal)}</p>
                  <p className="text-xs text-[#8a7f74]">{formatarPeso(ing.pesoLiquidoPorPessoa)}/pessoa</p>
                </div>
                <div className="bg-[#f9f7f4] rounded-xl p-2">
                  <p className="text-xs text-[#8a7f74] mb-1">Pós-cocção</p>
                  <p className="font-bold text-xs text-[#1a1a1a]">{formatarPeso(ing.pesoPoscoccaoTotal)}</p>
                  <p className="text-xs text-[#8a7f74]">{formatarPeso(ing.pesoPoscoccaoPorPessoa)}/pessoa</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#fff8f0] rounded-3xl p-5 border border-[#f0d4b8]">
          <h3 className="font-bold text-[#c8783a] mb-3">📊 Comparativo de cenários</h3>
          <div className="space-y-2">
            {(['conservador', 'moderado', 'agressivo'] as CenarioNome[]).map(c => (
              <div key={c} className="flex justify-between items-center text-sm">
                <span className="text-[#8a7f74] capitalize">{resultado[c].label}</span>
                <div className="flex gap-4">
                  <span className="text-[#1a1a1a] font-medium">Custo: {formatarMoeda(resultado[c].custoTotalReceita)}</span>
                  <span className="text-[#c8783a] font-bold">Venda: {formatarMoeda(resultado[c].precoVendaSugerido * numeroPessoas)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setEtapa('configurar'); setResultado(null); setIngredientes([]) }}
          className="w-full mt-6 border-2 border-[#c8783a] text-[#c8783a] font-semibold py-4 rounded-2xl"
        >
          Nova calculadora
        </button>
      </main>
    )
  }

  if (etapa === 'ingredientes') {
    return (
      <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEtapa('configurar')} className="text-[#c8783a] text-sm font-medium">← Voltar</button>
          <h1 className="text-xl font-bold text-[#1a1a1a] flex-1">Ingredientes</h1>
          <span className="text-sm text-[#8a7f74]">{numeroPessoas}p</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e5e0d8] shadow-sm mb-4">
          <h2 className="font-bold text-[#1a1a1a] mb-4 text-sm">Adicionar ingrediente</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#8a7f74] mb-1">Nome do ingrediente</label>
              <input
                type="text"
                value={novoNome}
                onChange={e => { setNovoNome(e.target.value); buscarFatores(e.target.value) }}
                placeholder="Ex: Frango peito sem osso"
                list="lista-alimentos"
                className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
              />
              <datalist id="lista-alimentos">
                {tabelaAlimentos.map(a => <option key={a.nome} value={a.nome} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8a7f74] mb-1">Qtd. líquida da receita (kg)</label>
                <input
                  type="number"
                  value={novaQtd}
                  onChange={e => setNovaQtd(e.target.value)}
                  placeholder="Ex: 1.5"
                  step="0.1"
                  min="0"
                  className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8a7f74] mb-1">Preço por kg (R$)</label>
                <input
                  type="number"
                  value={novoPreco}
                  onChange={e => setNovoPreco(e.target.value)}
                  placeholder="Ex: 28.90"
                  step="0.01"
                  min="0"
                  className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8a7f74] mb-1">Fator de correção (FC)</label>
                <input
                  type="number"
                  value={novoFc}
                  onChange={e => setNovoFc(e.target.value)}
                  step="0.01"
                  min="1"
                  className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
                />
                <p className="text-xs text-[#8a7f74] mt-1">Preenchido automático</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8a7f74] mb-1">Fator de cocção</label>
                <input
                  type="number"
                  value={novoFcoccao}
                  onChange={e => setNovoFcoccao(e.target.value)}
                  step="0.01"
                  min="0.1"
                  className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
                />
                <p className="text-xs text-[#8a7f74] mt-1">Pós-cozimento</p>
              </div>
            </div>

            <button
              onClick={adicionarIngrediente}
              disabled={!novoNome || !novaQtd || !novoPreco}
              className="w-full bg-[#c8783a] text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-40"
            >
              + Adicionar ingrediente
            </button>
          </div>
        </div>

        {ingredientes.length > 0 && (
          <div className="space-y-2 mb-6">
            <h2 className="font-bold text-[#1a1a1a] text-sm">Ingredientes adicionados ({ingredientes.length})</h2>
            {ingredientes.map(ing => (
              <div key={ing.id} className="bg-white rounded-2xl px-4 py-3 border border-[#e5e0d8] flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-[#1a1a1a]">{ing.nome}</p>
                  <p className="text-xs text-[#8a7f74]">{ing.quantidadeLiquidaKg}kg líq. · FC {ing.fatorCorrecao} · R${ing.precoUnitario}/kg</p>
                </div>
                <button onClick={() => removerIngrediente(ing.id)} className="text-red-400 text-lg px-2">×</button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={calcular}
          disabled={ingredientes.length === 0}
          className="w-full bg-[#c8783a] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-40"
        >
          Calcular os 3 cenários →
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-[#c8783a] text-sm font-medium">← Voltar</Link>
        <h1 className="text-xl font-bold text-[#1a1a1a]">Nova calculadora</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#e5e0d8] shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Nome da receita</label>
          <input
            type="text"
            value={nomeReceita}
            onChange={e => setNomeReceita(e.target.value)}
            placeholder="Ex: Frango grelhado com legumes"
            className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
            Número de pessoas: <span className="text-[#c8783a] font-bold">{numeroPessoas}</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={numeroPessoas}
            onChange={e => setNumeroPessoas(parseInt(e.target.value))}
            className="w-full accent-[#c8783a]"
          />
          <div className="flex justify-between text-xs text-[#8a7f74] mt-1">
            <span>1</span><span>50</span><span>100</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
            Porções da receita original: <span className="text-[#c8783a] font-bold">{porcoes}</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={porcoes}
            onChange={e => setPorcoes(parseInt(e.target.value))}
            className="w-full accent-[#c8783a]"
          />
          <p className="text-xs text-[#8a7f74] mt-1">Para quantas pessoas a receita foi escrita?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Markup (multiplicador do custo)</label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 2.5, 3, 3.5].map(m => (
              <button
                key={m}
                onClick={() => setMarkup(m)}
                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${markup === m ? 'bg-[#c8783a] text-white border-[#c8783a]' : 'bg-[#f9f7f4] text-[#8a7f74] border-[#e5e0d8]'}`}
              >
                {m}x
              </button>
            ))}
          </div>
          <p className="text-xs text-[#8a7f74] mt-2">
            Food cost: {Math.round(100 / markup)}% · Recomendado: 3x ({Math.round(100/3)}% food cost)
          </p>
        </div>
      </div>

      <div className="mt-4 bg-[#fff8f0] rounded-3xl p-5 border border-[#f0d4b8]">
        <h3 className="font-bold text-[#c8783a] mb-2 text-sm">📌 O que são os 3 cenários?</h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="w-20 font-medium text-blue-600">Conservador</span><span className="text-[#8a7f74]">85% — cardápio variado, apetite leve</span></div>
          <div className="flex gap-2"><span className="w-20 font-medium text-green-600">Moderado</span><span className="text-[#8a7f74]">100% — refeição padrão</span></div>
          <div className="flex gap-2"><span className="w-20 font-medium text-orange-500">Agressivo</span><span className="text-[#8a7f74]">125% — evento especial, muita fome</span></div>
        </div>
      </div>

      <button
        onClick={() => setEtapa('ingredientes')}
        disabled={!nomeReceita}
        className="w-full mt-6 bg-[#c8783a] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-40"
      >
        Próximo: Ingredientes →
      </button>
    </main>
  )
}
