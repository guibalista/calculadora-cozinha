'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { totalEquivalente, somarHospedes } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'

interface Ingrediente { nome: string; qtdPorEquiv: number; fc: number; categoria: string }
interface Prato { id: string; nome: string; ingredientes: Ingrediente[] }
interface Dia { indice: number; label: string; pratos: Prato[]; extrasHomens: number; extrasMulheres: number; extrasCriancas: number }
interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numeroDias: number; dias: Dia[] }

const CATEGORIAS: Record<string, string> = {
  proteina: 'Proteínas',
  vegetal: 'Vegetais',
  carboidrato: 'Carboidratos',
  fruta: 'Frutas',
  laticinios: 'Laticínios',
  tempero: 'Temperos',
}

export default function ListaComprasPage() {
  const { id } = useParams<{ id: string }>()
  const [estadia, setEstadia] = useState<Estadia | null>(null)

  useEffect(() => {
    const estadias = JSON.parse(localStorage.getItem('estadias') || '[]')
    setEstadia(estadias.find((e: Estadia) => e.id === id) ?? null)
  }, [id])

  if (!estadia) return <div className="flex items-center justify-center min-h-screen"><p style={{ color: '#717171' }}>Carregando...</p></div>

  // Consolidar todos os ingredientes da semana
  const totais: Record<string, { categoria: string; liquido: number; bruto: number }> = {}

  for (const dia of estadia.dias) {
    const hospedes = somarHospedes(
      { homens: estadia.homens, mulheres: estadia.mulheres, criancas: estadia.criancas },
      { homens: dia.extrasHomens, mulheres: dia.extrasMulheres, criancas: dia.extrasCriancas }
    )
    const equiv = totalEquivalente(hospedes)

    for (const prato of dia.pratos) {
      for (const ing of prato.ingredientes) {
        const liquido = ing.qtdPorEquiv * equiv
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

  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#F7F5F2' }}>
      <div className="flex items-center justify-between mb-8">
        <Link href={`/estadia/${id}`} className="text-sm font-medium underline" style={{ color: '#222' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Lista de compras</h1>
      <p className="text-sm mb-6" style={{ color: '#717171' }}>
        {estadia.nome} · {diasComPratos} dia{diasComPratos !== 1 ? 's' : ''} · {totalItens} ingrediente{totalItens !== 1 ? 's' : ''}
      </p>

      {totalItens === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg mb-2" style={{ color: '#222' }}>Nenhum prato adicionado</p>
          <p className="text-sm mb-6" style={{ color: '#717171' }}>Adicione pratos nos dias da estadia para gerar a lista</p>
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
              {itens.sort((a, b) => b.bruto - a.bruto).map((item, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: i < itens.length - 1 ? '1px solid #F0EEEB' : 'none' }}>
                  <p className="text-base" style={{ color: '#222' }}>{item.nome}</p>
                  <div className="text-right">
                    <p className="font-semibold text-base" style={{ color: '#222' }}>{formatarPeso(item.bruto)}</p>
                    <p className="text-xs" style={{ color: '#717171' }}>{formatarPeso(item.liquido)} líq.</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

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
                <span style={{ color: '#717171' }}>Total de ingredientes</span>
                <span style={{ color: '#222' }}>{totalItens}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="h-8" />
    </main>
  )
}
