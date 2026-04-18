'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { totalEquivalente, somarHospedes } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'

interface Ingrediente { nome: string; gramasPorPessoa: number; fc: number; categoria: string }
interface Prato { id: string; nome: string; ingredientes: Ingrediente[] }
interface Dia { indice: number; label: string; pratos: Prato[]; extrasHomens: number; extrasMulheres: number; extrasCriancas: number }
interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numeroDias: number; dias: Dia[] }

const CATEGORIAS: Record<string, string> = {
  proteina: 'Proteínas', vegetal: 'Vegetais', carboidrato: 'Carboidratos',
  fruta: 'Frutas', laticinios: 'Laticínios', tempero: 'Temperos e Condimentos',
  bebida: 'Bebidas', padaria: 'Padaria',
}

// Pesos médios por unidade (gramas) para conversão
const PESOS_UNITARIOS: Record<string, { unidade: string; gramas: number }> = {
  'Cebola': { unidade: 'und.', gramas: 150 },
  'Alho': { unidade: 'cabeça', gramas: 50 },
  'Tomate': { unidade: 'und.', gramas: 120 },
  'Limão': { unidade: 'und.', gramas: 80 },
  'Laranja': { unidade: 'und.', gramas: 200 },
  'Banana': { unidade: 'und.', gramas: 150 },
  'Maçã': { unidade: 'und.', gramas: 180 },
  'Batata inglesa': { unidade: 'und.', gramas: 180 },
  'Batata-doce': { unidade: 'und.', gramas: 200 },
  'Cenoura': { unidade: 'und.', gramas: 100 },
  'Abobrinha': { unidade: 'und.', gramas: 350 },
  'Berinjela': { unidade: 'und.', gramas: 400 },
  'Brócolis': { unidade: 'und.', gramas: 500 },
  'Couve-flor': { unidade: 'und.', gramas: 700 },
  'Pimentão vermelho': { unidade: 'und.', gramas: 150 },
  'Pimentão verde': { unidade: 'und.', gramas: 150 },
  'Pimentão amarelo': { unidade: 'und.', gramas: 150 },
  'Ovos': { unidade: 'und.', gramas: 60 },
  'Pão francês': { unidade: 'und.', gramas: 50 },
  'Pão de forma': { unidade: 'pacote', gramas: 500 },
  'Manga': { unidade: 'und.', gramas: 300 },
  'Mamão': { unidade: 'und.', gramas: 800 },
  'Abacaxi': { unidade: 'und.', gramas: 1200 },
  'Melão': { unidade: 'und.', gramas: 1200 },
  'Melancia': { unidade: 'und.', gramas: 5000 },
  'Coco fresco': { unidade: 'und.', gramas: 900 },
  'Mandioca': { unidade: 'und.', gramas: 800 },
  'Milho verde': { unidade: 'und.', gramas: 250 },
  'Abacate': { unidade: 'und.', gramas: 350 },
  'Morango': { unidade: 'bandeja', gramas: 300 },
  'Frango inteiro': { unidade: 'und.', gramas: 1800 },
  'Limão siciliano': { unidade: 'und.', gramas: 130 },
}

type Cenario = 'moderado' | 'conservador' | 'agressivo'
const FATORES: Record<Cenario, number> = { moderado: 0.85, conservador: 1.00, agressivo: 1.25 }

function converterUnidade(nome: string, brutoKg: number): string | null {
  const u = PESOS_UNITARIOS[nome]
  if (!u) return null
  const qtd = Math.ceil((brutoKg * 1000) / u.gramas)
  if (qtd < 1) return null
  return `≈ ${qtd} ${u.unidade}`
}

export default function ListaComprasPage() {
  const { id } = useParams<{ id: string }>()
  const [estadia, setEstadia] = useState<Estadia | null>(null)
  const [cenario, setCenario] = useState<Cenario>('conservador')

  useEffect(() => {
    const estadias = JSON.parse(localStorage.getItem('estadias') || '[]')
    setEstadia(estadias.find((e: Estadia) => e.id === id) ?? null)
  }, [id])

  if (!estadia) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F7F5F2' }}>
      <p style={{ color: '#717171' }}>Carregando...</p>
    </div>
  )

  const fator = FATORES[cenario]

  // Consolidar todos os ingredientes
  const totais: Record<string, { categoria: string; liquido: number; bruto: number }> = {}
  for (const dia of estadia.dias) {
    const hospedes = somarHospedes(
      { homens: estadia.homens, mulheres: estadia.mulheres, criancas: estadia.criancas },
      { homens: dia.extrasHomens, mulheres: dia.extrasMulheres, criancas: dia.extrasCriancas }
    )
    const equiv = totalEquivalente(hospedes)
    for (const prato of dia.pratos) {
      for (const ing of prato.ingredientes) {
        const liquido = (ing.gramasPorPessoa / 1000) * equiv * fator
        const bruto = liquido * ing.fc
        if (!totais[ing.nome]) totais[ing.nome] = { categoria: ing.categoria, liquido: 0, bruto: 0 }
        totais[ing.nome].liquido += liquido
        totais[ing.nome].bruto += bruto
      }
    }
  }

  // Agrupar por categoria
  const porCategoria: Record<string, Array<{ nome: string; liquido: number; bruto: number }>> = {}
  for (const [nome, v] of Object.entries(totais)) {
    if (!porCategoria[v.categoria]) porCategoria[v.categoria] = []
    porCategoria[v.categoria].push({ nome, ...v })
  }

  const totalItens = Object.keys(totais).length
  const diasComPratos = estadia.dias.filter(d => d.pratos.length > 0).length

  const cenarios: { key: Cenario; label: string; desc: string }[] = [
    { key: 'moderado', label: 'Moderado', desc: '−15%' },
    { key: 'conservador', label: 'Conservador', desc: 'padrão' },
    { key: 'agressivo', label: 'Agressivo', desc: '+25%' },
  ]

  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#F7F5F2' }}>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/estadia/${id}`} className="text-sm font-medium underline" style={{ color: '#222' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Lista de compras</h1>
      <p className="text-sm mb-6" style={{ color: '#717171' }}>
        {estadia.nome} · {diasComPratos} dia{diasComPratos !== 1 ? 's' : ''} · {totalItens} ingrediente{totalItens !== 1 ? 's' : ''}
      </p>

      {/* Seletor de cenário */}
      <div className="bg-white rounded-3xl p-4 mb-6" style={{ border: '1.5px solid #EBEBEB' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>Perfil de compra</p>
        <div className="grid grid-cols-3 gap-2">
          {cenarios.map(c => (
            <button key={c.key} onClick={() => setCenario(c.key)}
              className="py-3 rounded-2xl text-center transition-all"
              style={cenario === c.key
                ? { background: '#222', color: '#fff' }
                : { background: '#F7F5F2', color: '#717171', border: '1.5px solid #EBEBEB' }}>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-xs mt-0.5" style={{ color: cenario === c.key ? 'rgba(255,255,255,0.6)' : '#9B8B7A' }}>{c.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: '#9B8B7A' }}>
          {cenario === 'moderado' && 'Apetite leve — ligeiramente abaixo do padrão'}
          {cenario === 'conservador' && 'Quantidade padrão — calculada por pessoa'}
          {cenario === 'agressivo' && 'Garantido sobrar — ideal para grupos com muito apetite'}
        </p>
      </div>

      {totalItens === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg mb-2" style={{ color: '#222' }}>Nenhum prato adicionado</p>
          <p className="text-sm mb-6" style={{ color: '#717171' }}>Adicione refeições nos dias para gerar a lista</p>
          <Link href={`/estadia/${id}`}
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#222', color: '#fff' }}>
            Planejar cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(porCategoria).map(([cat, itens]) => (
            <div key={cat} className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #EBEBEB' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #EBEBEB' }}>
                <p className="font-semibold text-sm" style={{ color: '#9B8B7A' }}>
                  {CATEGORIAS[cat] ?? cat}
                </p>
              </div>
              {itens.sort((a, b) => b.bruto - a.bruto).map((item, i) => {
                const unidade = converterUnidade(item.nome, item.bruto)
                return (
                  <div key={i} className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: i < itens.length - 1 ? '1px solid #F0EEEB' : 'none' }}>
                    <div>
                      <p className="text-base" style={{ color: '#222' }}>{item.nome}</p>
                      {unidade && (
                        <p className="text-xs mt-0.5" style={{ color: '#9B8B7A' }}>{unidade}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-base" style={{ color: '#222' }}>{formatarPeso(item.bruto)}</p>
                      <p className="text-xs" style={{ color: '#717171' }}>{formatarPeso(item.liquido)} líq.</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Resumo */}
          <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #EBEBEB' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>Resumo</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#717171' }}>Hóspedes fixos</span>
                <span style={{ color: '#222' }}>{estadia.homens + estadia.mulheres + estadia.criancas} pessoas</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#717171' }}>Dias planejados</span>
                <span style={{ color: '#222' }}>{diasComPratos} de {estadia.numeroDias}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#717171' }}>Cenário aplicado</span>
                <span className="font-medium" style={{ color: '#222' }}>
                  {cenario === 'moderado' ? 'Moderado (−15%)' : cenario === 'conservador' ? 'Conservador (padrão)' : 'Agressivo (+25%)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="h-8" />
    </main>
  )
}
