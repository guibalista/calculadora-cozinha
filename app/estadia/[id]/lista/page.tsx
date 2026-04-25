'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { totalEquivalente, somarHospedes } from '@/lib/percapita'
import { agruparPorSetor, gerarTextoWhatsApp, type ItemLista } from '@/lib/setores'
import { baixarPDF, type SecaoPDF } from '@/lib/exportar-pdf'
import { converterParaCompra } from '@/lib/unidades-compra'

interface Ingrediente { nome: string; gramasPorPessoa: number; fc: number; categoria: string }
interface Prato { id: string; nome: string; ingredientes: Ingrediente[] }
interface Dia { indice: number; label: string; pratos: Prato[]; extrasHomens: number; extrasMulheres: number; extrasCriancas: number }
interface Estadia { id: string; nome: string; homens: number; mulheres: number; criancas: number; numero_dias: number; data_inicio?: string; data_fim?: string; dias: Dia[] }

type Cenario = 'moderado' | 'conservador' | 'agressivo'
const FATORES: Record<Cenario, number> = { moderado: 0.85, conservador: 1.00, agressivo: 1.25 }

function getPrecos(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('precos_ingredientes') || '{}') } catch { return {} }
}
function savePrecos(p: Record<string, number>) {
  localStorage.setItem('precos_ingredientes', JSON.stringify(p))
}

export default function ListaComprasPage() {
  const { id } = useParams<{ id: string }>()
  const [estadia, setEstadia] = useState<Estadia | null>(null)
  const [cenario, setCenario] = useState<Cenario>('conservador')
  const [gerando, setGerando] = useState<'consolidado' | 'pordia' | null>(null)
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [editando, setEditando] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')
  const [precos, setPrecos] = useState<Record<string, number>>({})
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null)
  const [editPrecoInput, setEditPrecoInput] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('estadias')
        .select('id, nome, homens, mulheres, criancas, numero_dias, data_inicio, data_fim, dias')
        .eq('id', id)
        .single()
      setEstadia((data as Estadia) ?? null)
    }
    carregar()
  }, [id])

  useEffect(() => { setPrecos(getPrecos()) }, [])
  useEffect(() => { setOverrides({}) }, [cenario])

  if (!estadia) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F0F7F2' }}>
      <p style={{ color: '#5A7A68' }}>Carregando...</p>
    </div>
  )

  const fator = FATORES[cenario]

  // Lista consolidada
  const totaisMap: Record<string, { categoria: string; liquido: number; bruto: number }> = {}
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
        if (!totaisMap[ing.nome]) totaisMap[ing.nome] = { categoria: ing.categoria, liquido: 0, bruto: 0 }
        totaisMap[ing.nome].liquido += liquido
        totaisMap[ing.nome].bruto += bruto
      }
    }
  }

  const itensList: ItemLista[] = Object.entries(totaisMap).map(([nome, v]) => {
    const bruto = overrides[nome] ?? v.bruto
    return { nome, categoria: v.categoria, brutoKg: bruto, liquidoKg: v.liquido, compra: converterParaCompra(nome, bruto) }
  })
  const grupos = agruparPorSetor(itensList)
  const totalItens = itensList.length
  const diasComPratos = estadia.dias.filter(d => d.pratos.length > 0).length
  const totalPessoas = estadia.homens + estadia.mulheres + estadia.criancas

  const descPessoas = [
    estadia.homens > 0 ? `${estadia.homens}H` : '',
    estadia.mulheres > 0 ? `${estadia.mulheres}M` : '',
    estadia.criancas > 0 ? `${estadia.criancas}C` : '',
  ].filter(Boolean).join(' ')

  const periodo = estadia.data_inicio && estadia.data_fim
    ? `${new Date(estadia.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${new Date(estadia.data_fim + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    : undefined

  const nomeCenario = cenario === 'moderado' ? 'Moderado (-15%)' : cenario === 'conservador' ? 'Conservador (padrao)' : 'Agressivo (+25%)'

  // Lista por dia (para PDF separado)
  function calcularPorDia(): SecaoPDF[] {
    return estadia!.dias
      .filter(d => d.pratos.length > 0)
      .map(dia => {
        const hospedes = somarHospedes(
          { homens: estadia!.homens, mulheres: estadia!.mulheres, criancas: estadia!.criancas },
          { homens: dia.extrasHomens, mulheres: dia.extrasMulheres, criancas: dia.extrasCriancas }
        )
        const equiv = totalEquivalente(hospedes) * fator
        const map: Record<string, { categoria: string; bruto: number }> = {}
        for (const prato of dia.pratos) {
          for (const ing of prato.ingredientes) {
            const bruto = (ing.gramasPorPessoa / 1000) * ing.fc * equiv
            if (!map[ing.nome]) map[ing.nome] = { categoria: ing.categoria, bruto: 0 }
            map[ing.nome].bruto += bruto
          }
        }
        const itens: ItemLista[] = Object.entries(map).map(([nome, v]) => ({
          nome, categoria: v.categoria, brutoKg: v.bruto, liquidoKg: v.bruto,
          compra: converterParaCompra(nome, v.bruto),
        }))
        return { titulo: dia.label, grupos: agruparPorSetor(itens) }
      })
  }

  function iniciarEdit(nome: string, brutoKg: number) {
    setEditando(nome); setEditInput(String(Math.round(brutoKg * 1000)))
  }
  function confirmarEdit() {
    if (!editando) return
    const g = parseFloat(editInput)
    if (!isNaN(g) && g > 0) setOverrides(p => ({ ...p, [editando]: g / 1000 }))
    setEditando(null)
  }

  function iniciarEditPreco(nome: string) {
    setEditandoPreco(nome)
    setEditPrecoInput(precos[nome] ? String(precos[nome]) : '')
  }
  function confirmarEditPreco() {
    if (!editandoPreco) return
    const v = parseFloat(editPrecoInput.replace(',', '.'))
    const novos = { ...precos }
    if (!isNaN(v) && v > 0) novos[editandoPreco] = v
    else delete novos[editandoPreco]
    setPrecos(novos)
    savePrecos(novos)
    setEditandoPreco(null)
  }

  function custoItem(nome: string, brutoKg: number): number | null {
    const p = precos[nome]
    if (!p) return null
    return brutoKg * p
  }

  async function exportarPDF(modo: 'consolidado' | 'pordia') {
    setGerando(modo)
    if (modo === 'pordia') {
      await baixarPDF({
        nomeEvento: estadia!.nome, data: periodo,
        totalPessoas: `${totalPessoas} pessoas (${descPessoas})`,
        cenario: nomeCenario, grupos, modo: 'por_secao', secoes: calcularPorDia(),
      })
    } else {
      await baixarPDF({
        nomeEvento: estadia!.nome, data: periodo,
        totalPessoas: `${totalPessoas} pessoas (${descPessoas})`,
        cenario: nomeCenario, grupos,
      })
    }
    setGerando(null)
  }

  function enviarWhatsApp() {
    const texto = gerarTextoWhatsApp({
      nomeEvento: estadia!.nome, data: periodo,
      totalPessoas: `${totalPessoas} pessoas`, cenario: nomeCenario, grupos,
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const cenarios: { key: Cenario; label: string; desc: string }[] = [
    { key: 'moderado', label: 'Moderado', desc: '−15%' },
    { key: 'conservador', label: 'Conservador', desc: 'padrão' },
    { key: 'agressivo', label: 'Agressivo', desc: '+25%' },
  ]

  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#F0F7F2' }}>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/estadia/${id}`} className="text-sm font-medium" style={{ color: '#128C7E' }}>← Voltar</Link>
        {totalItens > 0 && (
          <button onClick={enviarWhatsApp}
            className="px-3 py-2 rounded-2xl text-sm font-semibold"
            style={{ background: '#25D366', color: '#fff' }}>
            WhatsApp
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A2E25' }}>Lista de compras</h1>
      <p className="text-sm mb-6" style={{ color: '#5A7A68' }}>
        {estadia.nome} · {diasComPratos} dia{diasComPratos !== 1 ? 's' : ''} · {totalItens} ingrediente{totalItens !== 1 ? 's' : ''}
        {Object.keys(overrides).length > 0 && (
          <span className="ml-2 text-xs font-medium" style={{ color: '#128C7E' }}>
            · {Object.keys(overrides).length} editado{Object.keys(overrides).length > 1 ? 's' : ''}
          </span>
        )}
      </p>

      {/* Perfil de compra */}
      <div className="bg-white rounded-3xl p-4 mb-6" style={{ border: '1.5px solid #D4EDE0' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7BA892' }}>Perfil de compra</p>
        <div className="grid grid-cols-3 gap-2">
          {cenarios.map(c => (
            <button key={c.key} onClick={() => setCenario(c.key)}
              className="py-3 rounded-2xl text-center"
              style={cenario === c.key
                ? { background: '#128C7E', color: '#fff' }
                : { background: '#F0F7F2', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-xs mt-0.5" style={{ color: cenario === c.key ? 'rgba(255,255,255,0.7)' : '#7BA892' }}>{c.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: '#7BA892' }}>
          {cenario === 'moderado' && 'Apetite leve — ligeiramente abaixo do padrão'}
          {cenario === 'conservador' && 'Quantidade padrão — calculada por pessoa'}
          {cenario === 'agressivo' && 'Garantido sobrar — ideal para grupos com muito apetite'}
        </p>
      </div>

      {totalItens === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg mb-2" style={{ color: '#1A2E25' }}>Nenhuma refeição adicionada</p>
          <p className="text-sm mb-6" style={{ color: '#5A7A68' }}>Adicione refeições nos dias para gerar a lista</p>
          <Link href={`/estadia/${id}`} className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#128C7E', color: '#fff' }}>
            Planejar cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(grupo => {
            const custoSetor = grupo.itens.reduce((sum, item) => {
              const c = custoItem(item.nome, overrides[item.nome] ?? item.brutoKg)
              return sum + (c ?? 0)
            }, 0)
            const temCustoSetor = grupo.itens.some(item => precos[item.nome])
            return (
              <div key={grupo.setor} className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #D4EDE0' }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E4F2EA', background: '#F5FAF7' }}>
                  <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#7BA892' }}>{grupo.setor}</p>
                  {temCustoSetor && (
                    <p className="text-xs font-semibold" style={{ color: '#128C7E' }}>
                      R$ {custoSetor.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
                {grupo.itens.map((item, i) => {
                  const bruto = overrides[item.nome] ?? item.brutoKg
                  const custo = custoItem(item.nome, bruto)
                  return (
                    <div key={i} className="px-5 py-3.5"
                      style={{ borderBottom: i < grupo.itens.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-base" style={{ color: '#1A2E25' }}>{item.nome}</p>
                        <div className="text-right ml-4">
                          {editando === item.nome ? (
                            <div className="flex items-center gap-1 justify-end">
                              <input type="number" value={editInput}
                                onChange={e => setEditInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') confirmarEdit(); if (e.key === 'Escape') setEditando(null) }}
                                autoFocus
                                className="w-16 text-right text-sm font-semibold outline-none rounded-lg px-2 py-0.5"
                                style={{ border: '1.5px solid #128C7E', color: '#1A2E25' }} />
                              <span className="text-xs" style={{ color: '#7BA892' }}>g</span>
                              <button onClick={confirmarEdit} className="font-bold text-sm" style={{ color: '#128C7E' }}>✓</button>
                              <button onClick={() => setEditando(null)} className="text-sm" style={{ color: '#7BA892' }}>×</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 justify-end">
                              <p className="font-semibold text-base"
                                style={{ color: overrides[item.nome] ? '#128C7E' : '#1A2E25' }}>
                                {item.compra}
                              </p>
                              <button onClick={() => iniciarEdit(item.nome, item.brutoKg)}
                                className="text-base opacity-40 hover:opacity-80 transition-opacity"
                                style={{ color: '#7BA892', lineHeight: 1 }}>✎</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div />
                        {editandoPreco === item.nome ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: '#7BA892' }}>R$</span>
                            <input type="number" value={editPrecoInput}
                              onChange={e => setEditPrecoInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') confirmarEditPreco(); if (e.key === 'Escape') setEditandoPreco(null) }}
                              autoFocus placeholder="preço/kg"
                              className="w-20 text-right text-xs outline-none rounded-lg px-2 py-0.5"
                              style={{ border: '1.5px solid #128C7E', color: '#1A2E25' }} />
                            <span className="text-xs" style={{ color: '#7BA892' }}>/kg</span>
                            <button onClick={confirmarEditPreco} className="font-bold text-xs" style={{ color: '#128C7E' }}>✓</button>
                            <button onClick={() => setEditandoPreco(null)} className="text-xs" style={{ color: '#7BA892' }}>×</button>
                          </div>
                        ) : (
                          <button onClick={() => iniciarEditPreco(item.nome)}
                            className="text-xs"
                            style={{ color: custo !== null ? '#128C7E' : '#C8E4D4' }}>
                            {custo !== null
                              ? `R$ ${custo.toFixed(2).replace('.', ',')}`
                              : '+ preço'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Resumo */}
          <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7BA892' }}>Resumo</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Estadia</span>
                <span style={{ color: '#1A2E25' }}>{estadia.nome}</span>
              </div>
              {periodo && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#5A7A68' }}>Período</span>
                  <span style={{ color: '#1A2E25' }}>{periodo}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Hóspedes</span>
                <span style={{ color: '#1A2E25' }}>{totalPessoas} pessoas ({descPessoas})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Dias planejados</span>
                <span style={{ color: '#1A2E25' }}>{diasComPratos} de {estadia.numero_dias}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Cenário</span>
                <span className="font-medium" style={{ color: '#128C7E' }}>{nomeCenario}</span>
              </div>
              {(() => {
                const totalCusto = itensList.reduce((sum, item) => {
                  const c = custoItem(item.nome, overrides[item.nome] ?? item.brutoKg)
                  return sum + (c ?? 0)
                }, 0)
                const itensComPreco = itensList.filter(item => precos[item.nome]).length
                if (itensComPreco === 0) return null
                return (
                  <>
                    <div style={{ borderTop: '1px solid #E4F2EA', marginTop: 8, paddingTop: 8 }} />
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#5A7A68' }}>
                        Custo estimado
                        {itensComPreco < totalItens && (
                          <span className="ml-1 text-xs" style={{ color: '#7BA892' }}>
                            ({itensComPreco}/{totalItens} ingredientes)
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-base" style={{ color: '#1A2E25' }}>
                        R$ {totalCusto.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Exportar */}
          <div className="space-y-2 pt-2 pb-4">
            <button onClick={enviarWhatsApp}
              className="w-full py-4 rounded-2xl font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff' }}>
              Enviar WhatsApp
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => exportarPDF('consolidado')} disabled={gerando !== null}
                className="py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
                style={{ background: '#128C7E', color: '#fff' }}>
                {gerando === 'consolidado' ? 'Gerando...' : 'PDF Consolidado'}
              </button>
              <button onClick={() => exportarPDF('pordia')} disabled={gerando !== null}
                className="py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
                style={{ background: '#fff', color: '#128C7E', border: '1.5px solid #128C7E' }}>
                {gerando === 'pordia' ? 'Gerando...' : 'PDF Por Dia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
