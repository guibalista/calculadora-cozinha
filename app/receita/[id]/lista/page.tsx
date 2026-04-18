'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { totalEquivalente } from '@/lib/percapita'
import { formatarPeso } from '@/lib/lista-compras'
import { agruparPorSetor, gerarTextoWhatsApp, type ItemLista } from '@/lib/setores'
import { baixarPDF } from '@/lib/exportar-pdf'

interface IngPrato { nome: string; gramasPorPessoa: number; fc: number; categoria: string }
interface Refeicao { id: string; nome: string; ingredientes: IngPrato[] }
interface Evento { id: string; nome: string; data?: string; homens: number; mulheres: number; criancas: number; totalPessoas: number; refeicoes: Refeicao[] }

type Cenario = 'moderado' | 'conservador' | 'agressivo'
const FATORES: Record<Cenario, number> = { moderado: 0.85, conservador: 1.00, agressivo: 1.25 }

const PESOS_UNITARIOS: Record<string, { unidade: string; gramas: number }> = {
  'Cebola': { unidade: 'und.', gramas: 150 }, 'Alho': { unidade: 'cabeça', gramas: 50 },
  'Tomate': { unidade: 'und.', gramas: 120 }, 'Limão': { unidade: 'und.', gramas: 80 },
  'Laranja': { unidade: 'und.', gramas: 200 }, 'Banana': { unidade: 'und.', gramas: 150 },
  'Maçã': { unidade: 'und.', gramas: 180 }, 'Batata inglesa': { unidade: 'und.', gramas: 180 },
  'Batata-doce': { unidade: 'und.', gramas: 200 }, 'Cenoura': { unidade: 'und.', gramas: 100 },
  'Abobrinha': { unidade: 'und.', gramas: 350 }, 'Berinjela': { unidade: 'und.', gramas: 400 },
  'Brócolis': { unidade: 'und.', gramas: 500 }, 'Pimentão vermelho': { unidade: 'und.', gramas: 150 },
  'Pimentão verde': { unidade: 'und.', gramas: 150 }, 'Ovos': { unidade: 'und.', gramas: 60 },
  'Pão francês': { unidade: 'und.', gramas: 50 }, 'Manga': { unidade: 'und.', gramas: 300 },
  'Mamão': { unidade: 'und.', gramas: 800 }, 'Abacaxi': { unidade: 'und.', gramas: 1200 },
  'Melão': { unidade: 'und.', gramas: 1200 }, 'Mandioca': { unidade: 'und.', gramas: 800 },
  'Milho verde': { unidade: 'und.', gramas: 250 }, 'Frango inteiro': { unidade: 'und.', gramas: 1800 },
}

function converterUnidade(nome: string, brutoKg: number): string | null {
  const u = PESOS_UNITARIOS[nome]
  if (!u) return null
  const qtd = Math.ceil((brutoKg * 1000) / u.gramas)
  return qtd >= 1 ? `≈ ${qtd} ${u.unidade}` : null
}

export default function ListaReceitaPage() {
  const { id } = useParams<{ id: string }>()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [cenario, setCenario] = useState<Cenario>('conservador')
  const [gerando, setGerando] = useState(false)

  useEffect(() => {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    setEvento(eventos.find((e: Evento) => e.id === id) ?? null)
  }, [id])

  if (!evento) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F0F7F2' }}>
      <p style={{ color: '#5A7A68' }}>Carregando...</p>
    </div>
  )

  const fator = FATORES[cenario]
  const equiv = totalEquivalente({ homens: evento.homens, mulheres: evento.mulheres, criancas: evento.criancas })

  const totais: Record<string, { categoria: string; liquido: number; bruto: number }> = {}
  for (const ref of evento.refeicoes) {
    for (const ing of ref.ingredientes) {
      const liquido = (ing.gramasPorPessoa / 1000) * equiv * fator
      const bruto = liquido * ing.fc
      if (!totais[ing.nome]) totais[ing.nome] = { categoria: ing.categoria, liquido: 0, bruto: 0 }
      totais[ing.nome].liquido += liquido
      totais[ing.nome].bruto += bruto
    }
  }

  const itensList: ItemLista[] = Object.entries(totais).map(([nome, v]) => ({
    nome, categoria: v.categoria, brutoKg: v.bruto, liquidoKg: v.liquido,
    unidade: converterUnidade(nome, v.bruto),
  }))
  const grupos = agruparPorSetor(itensList)
  const totalItens = itensList.length

  const descPessoas = [
    evento.homens > 0 ? `${evento.homens} homem${evento.homens > 1 ? 'ns' : ''}` : '',
    evento.mulheres > 0 ? `${evento.mulheres} mulher${evento.mulheres > 1 ? 'es' : ''}` : '',
    evento.criancas > 0 ? `${evento.criancas} criança${evento.criancas > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ')

  const dataFormatada = evento.data
    ? new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : undefined

  const nomeCenario = cenario === 'moderado' ? 'Moderado (−15%)' : cenario === 'conservador' ? 'Conservador (padrão)' : 'Agressivo (+25%)'

  async function exportarPDF() {
    setGerando(true)
    await baixarPDF({
      nomeEvento: evento!.nome,
      data: dataFormatada,
      totalPessoas: `${evento!.totalPessoas} pessoas (${descPessoas})`,
      cenario: nomeCenario,
      grupos,
    })
    setGerando(false)
  }

  function enviarWhatsApp() {
    const texto = gerarTextoWhatsApp({
      nomeEvento: evento!.nome,
      data: dataFormatada,
      totalPessoas: `${evento!.totalPessoas} pessoas`,
      cenario: nomeCenario,
      grupos,
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
        <Link href={`/receita/${id}`} className="text-sm font-medium underline" style={{ color: '#128C7E' }}>← Voltar</Link>
        {totalItens > 0 && (
          <div className="flex gap-2">
            <button onClick={enviarWhatsApp}
              className="px-3 py-2 rounded-2xl text-sm font-semibold"
              style={{ background: '#25D366', color: '#fff' }}>
              WhatsApp
            </button>
            <button onClick={exportarPDF} disabled={gerando}
              className="px-3 py-2 rounded-2xl text-sm font-semibold disabled:opacity-60"
              style={{ background: '#128C7E', color: '#fff' }}>
              {gerando ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A2E25' }}>Lista de compras</h1>
      <p className="text-sm mb-6" style={{ color: '#5A7A68' }}>
        {evento.nome} · {evento.totalPessoas} pessoas · {totalItens} ingrediente{totalItens !== 1 ? 's' : ''}
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
          <Link href={`/receita/${id}`} className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#128C7E', color: '#fff' }}>
            Montar cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(grupo => (
            <div key={grupo.setor} className="bg-white rounded-3xl overflow-hidden" style={{ border: '1.5px solid #D4EDE0' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #E4F2EA', background: '#F5FAF7' }}>
                <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#7BA892' }}>{grupo.setor}</p>
              </div>
              {grupo.itens.map((item, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: i < grupo.itens.length - 1 ? '1px solid #E4F2EA' : 'none' }}>
                  <div>
                    <p className="text-base" style={{ color: '#1A2E25' }}>{item.nome}</p>
                    {item.unidade && <p className="text-xs mt-0.5" style={{ color: '#7BA892' }}>{item.unidade}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-base" style={{ color: '#1A2E25' }}>{formatarPeso(item.brutoKg)}</p>
                    <p className="text-xs" style={{ color: '#5A7A68' }}>{formatarPeso(item.liquidoKg)} líq.</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Resumo */}
          <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7BA892' }}>Resumo</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Evento</span>
                <span style={{ color: '#1A2E25' }}>{evento.nome}</span>
              </div>
              {dataFormatada && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#5A7A68' }}>Data</span>
                  <span style={{ color: '#1A2E25' }}>{dataFormatada}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Pessoas</span>
                <span style={{ color: '#1A2E25' }}>{descPessoas}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5A7A68' }}>Cenário</span>
                <span className="font-medium" style={{ color: '#128C7E' }}>{nomeCenario}</span>
              </div>
            </div>
          </div>

          {/* Botões rodapé */}
          <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
            <button onClick={enviarWhatsApp}
              className="py-4 rounded-2xl font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff' }}>
              Enviar WhatsApp
            </button>
            <button onClick={exportarPDF} disabled={gerando}
              className="py-4 rounded-2xl font-semibold text-sm disabled:opacity-60"
              style={{ background: '#128C7E', color: '#fff' }}>
              {gerando ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
