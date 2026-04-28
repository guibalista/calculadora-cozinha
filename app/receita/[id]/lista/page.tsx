'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { agruparPorSetor, gerarTextoWhatsApp, type ItemLista } from '@/lib/setores'
import { baixarPDF, type SecaoPDF } from '@/lib/exportar-pdf'
import { converterParaCompra } from '@/lib/unidades-compra'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; categoria: string }
interface Refeicao { id: string; nome: string; ingredientes: IngPrato[] }
interface Evento {
  id: string; nome: string; data?: string; totalPessoas: number
  duracao?: string; perfilConsumo?: string
  homens?: number; mulheres?: number; criancas?: number
  refeicoes: Refeicao[]
}

const FATORES_PERFIL: Record<string, number> = { leve: 0.80, moderado: 1.00, intenso: 1.30 }
const FATORES_DURACAO: Record<string, number> = { coquetel: 0.65, tarde: 1.00, noite: 1.15, dia: 1.45 }
const PERFIL_LABELS: Record<string, string> = { leve: 'Leve', moderado: 'Moderado', intenso: 'Intenso' }
const DURACAO_LABELS: Record<string, string> = { coquetel: 'Coquetel', tarde: 'Tarde', noite: 'Noite', dia: 'Dia inteiro' }

export default function ListaReceitaPage() {
  const { id } = useParams<{ id: string }>()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [gerando, setGerando] = useState<'consolidado' | 'porrefeicao' | null>(null)
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [editando, setEditando] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')

  useEffect(() => {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    setEvento(eventos.find((e: Evento) => e.id === id) ?? null)
  }, [id])

  if (!evento) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#1C1712' }}>
      <p style={{ color: '#9B8B7A' }}>Carregando...</p>
    </div>
  )

  const fatorPerfil = FATORES_PERFIL[evento.perfilConsumo || 'moderado'] ?? 1.0
  const fatorDuracao = FATORES_DURACAO[evento.duracao || 'tarde'] ?? 1.0
  const equiv = evento.totalPessoas * fatorPerfil * fatorDuracao

  const totais: Record<string, { categoria: string; liquido: number; bruto: number }> = {}
  for (const ref of evento.refeicoes) {
    for (const ing of ref.ingredientes) {
      const liquido = (ing.gramasPorPessoa / 1000) * equiv
      const bruto = liquido * ing.fc
      if (!totais[ing.nome]) totais[ing.nome] = { categoria: ing.categoria, liquido: 0, bruto: 0 }
      totais[ing.nome].liquido += liquido
      totais[ing.nome].bruto += bruto
    }
  }

  const itensList: ItemLista[] = Object.entries(totais).map(([nome, v]) => {
    const bruto = overrides[nome] ?? v.bruto
    return { nome, categoria: v.categoria, brutoKg: bruto, liquidoKg: v.liquido, compra: converterParaCompra(nome, bruto) }
  })
  const grupos = agruparPorSetor(itensList)
  const totalItens = itensList.length

  const dataFormatada = evento.data
    ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : undefined

  const descPerfil = [
    evento.perfilConsumo ? PERFIL_LABELS[evento.perfilConsumo] : 'Moderado',
    evento.duracao ? DURACAO_LABELS[evento.duracao] : 'Tarde',
  ].join(' · ')

  function iniciarEdit(nome: string, brutoKg: number) {
    setEditando(nome)
    setEditInput(String(Math.round(brutoKg * 1000)))
  }
  function confirmarEdit() {
    if (!editando) return
    const g = parseFloat(editInput)
    if (!isNaN(g) && g > 0) setOverrides(p => ({ ...p, [editando]: g / 1000 }))
    setEditando(null)
  }

  function calcularPorRefeicao(): SecaoPDF[] {
    return evento!.refeicoes.map(ref => {
      const map: Record<string, { categoria: string; bruto: number }> = {}
      for (const ing of ref.ingredientes) {
        const bruto = (ing.gramasPorPessoa / 1000) * ing.fc * equiv
        if (!map[ing.nome]) map[ing.nome] = { categoria: ing.categoria, bruto: 0 }
        map[ing.nome].bruto += bruto
      }
      const itens: ItemLista[] = Object.entries(map).map(([nome, v]) => ({
        nome, categoria: v.categoria, brutoKg: v.bruto, liquidoKg: v.bruto,
        compra: converterParaCompra(nome, v.bruto),
      }))
      return { titulo: ref.nome, grupos: agruparPorSetor(itens) }
    })
  }

  async function exportarPDF(modo: 'consolidado' | 'porrefeicao') {
    setGerando(modo)
    if (modo === 'porrefeicao') {
      await baixarPDF({
        nomeEvento: evento!.nome, data: dataFormatada,
        totalPessoas: `${evento!.totalPessoas} pessoas`,
        cenario: descPerfil, grupos, modo: 'por_secao', secoes: calcularPorRefeicao(),
      })
    } else {
      await baixarPDF({
        nomeEvento: evento!.nome, data: dataFormatada,
        totalPessoas: `${evento!.totalPessoas} pessoas`,
        cenario: descPerfil, grupos,
      })
    }
    setGerando(null)
  }

  function enviarWhatsApp() {
    const texto = gerarTextoWhatsApp({
      nomeEvento: evento!.nome,
      data: dataFormatada,
      totalPessoas: `${evento!.totalPessoas} pessoas`,
      cenario: descPerfil,
      grupos,
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#1C1712' }}>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/receita/${id}`} className="text-sm font-medium" style={{ color: '#C4823A' }}>← Voltar</Link>
        {totalItens > 0 && (
          <div className="flex gap-2">
            <button onClick={enviarWhatsApp}
              className="px-3 py-2 rounded-2xl text-sm font-semibold"
              style={{ background: '#25D366', color: '#fff' }}>
              WhatsApp
            </button>
            <button onClick={() => exportarPDF('consolidado')} disabled={gerando !== null}
              className="px-3 py-2 rounded-2xl text-sm font-semibold disabled:opacity-60"
              style={{ background: '#C4823A', color: '#fff' }}>
              {gerando ? 'Gerando...' : 'PDF'}
            </button>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#F2EBE0' }}>Lista de compras</h1>
      <p className="text-sm mb-2" style={{ color: '#9B8B7A' }}>
        {evento.nome} · {evento.totalPessoas} pessoas · {totalItens} ingrediente{totalItens !== 1 ? 's' : ''}
        {Object.keys(overrides).length > 0 && (
          <span className="ml-2 text-xs font-medium" style={{ color: '#C4823A' }}>
            · {Object.keys(overrides).length} editado{Object.keys(overrides).length > 1 ? 's' : ''}
          </span>
        )}
      </p>

      {/* Perfil aplicado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: '#2A2118', color: '#C4823A' }}>
          {evento.perfilConsumo ? PERFIL_LABELS[evento.perfilConsumo] : 'Moderado'}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: '#2A2118', color: '#C4823A' }}>
          {evento.duracao ? DURACAO_LABELS[evento.duracao] : 'Tarde'}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: '#252015', color: '#9B8B7A', border: '1px solid #3A2E22' }}>
          fator {(fatorPerfil * fatorDuracao).toFixed(2)}×
        </span>
      </div>

      {totalItens === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg mb-2" style={{ color: '#F2EBE0' }}>Nenhuma refeição adicionada</p>
          <Link href={`/receita/${id}`} className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#C4823A', color: '#fff' }}>
            Montar cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(grupo => (
            <div key={grupo.setor} className="rounded-3xl overflow-hidden" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #3A2E22', background: '#252015' }}>
                <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#9B8B7A' }}>{grupo.setor}</p>
              </div>
              {grupo.itens.map((item, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: i < grupo.itens.length - 1 ? '1px solid #3A2E22' : 'none' }}>
                  <p className="text-base" style={{ color: '#F2EBE0' }}>{item.nome}</p>
                  <div className="text-right ml-4">
                    {editando === item.nome ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number" value={editInput}
                          onChange={e => setEditInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmarEdit(); if (e.key === 'Escape') setEditando(null) }}
                          autoFocus
                          className="w-16 text-right text-sm font-semibold outline-none rounded-lg px-2 py-0.5"
                          style={{ border: '1.5px solid #C4823A', color: '#F2EBE0' }} />
                        <span className="text-xs" style={{ color: '#9B8B7A' }}>g</span>
                        <button onClick={confirmarEdit} className="font-bold text-sm" style={{ color: '#C4823A' }}>✓</button>
                        <button onClick={() => setEditando(null)} className="text-sm" style={{ color: '#9B8B7A' }}>×</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-end">
                        <p className="font-semibold text-base"
                          style={{ color: overrides[item.nome] ? '#C4823A' : '#F2EBE0' }}>
                          {item.compra}
                        </p>
                        <button
                          onClick={() => iniciarEdit(item.nome, item.brutoKg)}
                          className="text-base opacity-40 hover:opacity-80"
                          style={{ color: '#9B8B7A', lineHeight: 1 }}>
                          ✎
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Resumo */}
          <div className="rounded-3xl p-5" style={{ background: '#252015', border: '1.5px solid #3A2E22' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9B8B7A' }}>Resumo</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#9B8B7A' }}>Evento</span>
                <span style={{ color: '#F2EBE0' }}>{evento.nome}</span>
              </div>
              {dataFormatada && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#9B8B7A' }}>Data</span>
                  <span style={{ color: '#F2EBE0' }}>{dataFormatada}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: '#9B8B7A' }}>Pessoas</span>
                <span style={{ color: '#F2EBE0' }}>{evento.totalPessoas}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#9B8B7A' }}>Perfil</span>
                <span className="font-medium" style={{ color: '#C4823A' }}>{descPerfil}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 pb-4">
            <button onClick={enviarWhatsApp}
              className="w-full py-4 rounded-2xl font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff' }}>
              Enviar WhatsApp
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => exportarPDF('consolidado')} disabled={gerando !== null}
                className="py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
                style={{ background: '#C4823A', color: '#fff' }}>
                {gerando === 'consolidado' ? 'Gerando...' : 'PDF Consolidado'}
              </button>
              <button onClick={() => exportarPDF('porrefeicao')} disabled={gerando !== null}
                className="py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
                style={{ background: '#252015', color: '#C4823A', border: '1.5px solid #C4823A' }}>
                {gerando === 'porrefeicao' ? 'Gerando...' : 'PDF Por Refeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
