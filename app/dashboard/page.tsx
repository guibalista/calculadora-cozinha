'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Prato { id: string }
interface Dia { pratos: Prato[] }
interface Estadia {
  id: string; nome: string
  homens: number; mulheres: number; criancas: number
  numero_dias: number; data_inicio?: string; data_fim?: string
  dias?: Dia[]
}

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataHoje(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function periodo(e: Estadia): string {
  if (e.data_inicio && e.data_fim) {
    const ini = new Date(e.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const fim = new Date(e.data_fim + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    return `${ini} – ${fim}`
  }
  return `${e.numero_dias} dia${e.numero_dias !== 1 ? 's' : ''}`
}

function contarRefeicoes(e: Estadia): number {
  return (e.dias ?? []).reduce((acc, d) => acc + (d.pratos?.length ?? 0), 0)
}

function diasComRefeicao(e: Estadia): number {
  return (e.dias ?? []).filter(d => (d.pratos?.length ?? 0) > 0).length
}

function statusPlanejamento(e: Estadia): { label: string; cor: string } {
  const total = contarRefeicoes(e)
  const dias = diasComRefeicao(e)
  if (total === 0) return { label: 'Sem cardápio', cor: '#4A3C2E' }
  if (dias < e.numero_dias) return { label: `${dias}/${e.numero_dias} dias planejados`, cor: '#9B8B7A' }
  return { label: `${total} refeição${total !== 1 ? 'ões' : ''} · completo`, cor: '#5A8A5A' }
}

function ordenarEstadias(list: Estadia[]): Estadia[] {
  const hoje = new Date().toISOString().split('T')[0]
  return [...list].sort((a, b) => {
    const da = a.data_inicio ?? '9999'
    const db = b.data_inicio ?? '9999'
    // ativas primeiro (data_inicio <= hoje <= data_fim)
    const aAtiva = a.data_inicio && a.data_fim && a.data_inicio <= hoje && hoje <= a.data_fim
    const bAtiva = b.data_inicio && b.data_fim && b.data_inicio <= hoje && hoje <= b.data_fim
    if (aAtiva && !bAtiva) return -1
    if (!aAtiva && bAtiva) return 1
    // futuras por data mais próxima
    const aFutura = da > hoje
    const bFutura = db > hoje
    if (aFutura && bFutura) return da < db ? -1 : 1
    // passadas por data mais recente
    return da > db ? -1 : 1
  })
}

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])
  const [deletando, setDeletando] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('estadias')
        .select('id, nome, homens, mulheres, criancas, numero_dias, data_inicio, data_fim, dias')
        .order('created_at', { ascending: false })
      setEstadias(ordenarEstadias((data ?? []) as Estadia[]))
      setCarregando(false)
    }
    carregar()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function deletar(id: string) {
    await supabase.from('estadias').delete().eq('id', id)
    setEstadias(prev => prev.filter(e => e.id !== id))
    setDeletando(null)
  }

  async function duplicar(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: original } = await supabase
      .from('estadias')
      .select('nome, homens, mulheres, criancas, numero_dias, dias')
      .eq('id', id)
      .single()
    if (!original) return
    const novoId = Date.now().toString()
    const { data: inserido } = await supabase.from('estadias').insert({
      id: novoId,
      user_id: user.id,
      nome: `${original.nome} (cópia)`,
      homens: original.homens,
      mulheres: original.mulheres,
      criancas: original.criancas,
      numero_dias: original.numero_dias,
      dias: original.dias,
    }).select('id, nome, homens, mulheres, criancas, numero_dias, data_inicio, data_fim, dias').single()
    if (inserido) setEstadias(prev => ordenarEstadias([inserido as Estadia, ...prev]))
  }

  const total = estadias.length
  const hoje = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-5 py-8" style={{ background: '#1C1712' }}>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium mb-0.5 capitalize" style={{ color: '#9B8B7A' }}>{dataHoje()}</p>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: '#F2EBE0' }}>{saudacao()}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9B8B7A' }}>
            {carregando ? 'Carregando...' : total === 0 ? 'Nenhum planejamento ainda' : `${total} planejamento${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={sair}
            className="px-3 py-3 rounded-2xl text-sm font-medium"
            style={{ border: '1.5px solid #3A2E22', color: '#9B8B7A', background: '#252015' }}>
            Sair
          </button>
          <Link href="/estadia/nova"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#C4823A', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Novo
          </Link>
        </div>
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#C4823A', borderTopColor: 'transparent' }} />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl mb-5 flex items-center justify-center" style={{ background: '#2A2118' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#C4823A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="#C4823A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: '#F2EBE0' }}>Pronto para planejar</p>
          <p className="text-sm mb-6" style={{ color: '#9B8B7A' }}>Crie seu primeiro planejamento</p>
          <Link href="/estadia/nova"
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#C4823A', color: '#fff' }}>
            Criar planejamento
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {estadias.map((e) => {
            const totalP = e.homens + e.mulheres + e.criancas
            const partes = [
              e.homens > 0 ? `${e.homens}H` : '',
              e.mulheres > 0 ? `${e.mulheres}M` : '',
              e.criancas > 0 ? `${e.criancas}C` : '',
            ].filter(Boolean).join(' · ')
            const refeicoes = contarRefeicoes(e)
            const status = statusPlanejamento(e)
            const ativa = e.data_inicio && e.data_fim && e.data_inicio <= hoje && hoje <= e.data_fim

            return (
              <div key={e.id} className="rounded-3xl overflow-hidden"
                style={{ background: '#252015', border: deletando === e.id ? '1.5px solid #7A3A2A' : ativa ? '1.5px solid #C4823A' : '1.5px solid #3A2E22' }}>
                {deletando === e.id ? (
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <p className="text-sm font-semibold" style={{ color: '#F2EBE0' }}>Apagar planejamento?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setDeletando(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{ border: '1.5px solid #3A2E22', color: '#9B8B7A' }}>Cancelar</button>
                      <button onClick={() => deletar(e.id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: '#7A3A2A', color: '#fff' }}>Apagar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-stretch">
                    {/* Lado esquerdo — clicável para abrir planejamento */}
                    <Link href={`/estadia/${e.id}`} className="flex-1 px-5 py-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-sm leading-tight" style={{ color: '#F2EBE0' }}>{e.nome}</p>
                        {ativa && (
                          <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0"
                            style={{ background: '#C4823A', color: '#fff' }}>Ativa</span>
                        )}
                      </div>
                      <p className="text-xs mb-1" style={{ color: '#C4823A' }}>{periodo(e)}</p>
                      <p className="text-xs" style={{ color: '#9B8B7A' }}>
                        {totalP} hóspede{totalP !== 1 ? 's' : ''}{partes ? ` · ${partes}` : ''}
                      </p>
                      <p className="text-xs mt-2 font-medium" style={{ color: status.cor }}>
                        {status.label}
                      </p>
                    </Link>

                    {/* Lado direito — ações */}
                    <div className="flex flex-col border-l" style={{ borderColor: '#3A2E22' }}>
                      {refeicoes > 0 && (
                        <Link href={`/estadia/${e.id}/lista`}
                          className="flex-1 flex flex-col items-center justify-center px-4 gap-1 border-b"
                          style={{ borderColor: '#3A2E22' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#C4823A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 12h6M9 16h4" stroke="#C4823A" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                          <span className="text-xs font-semibold" style={{ color: '#C4823A' }}>Lista</span>
                        </Link>
                      )}
                      <button onClick={() => duplicar(e.id)}
                        className="flex-1 flex flex-col items-center justify-center px-4 gap-1 border-b"
                        style={{ borderColor: '#3A2E22' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="9" width="13" height="13" rx="2" stroke="#9B8B7A" strokeWidth="1.8"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#9B8B7A" strokeWidth="1.8"/>
                        </svg>
                        <span className="text-xs" style={{ color: '#9B8B7A' }}>Copiar</span>
                      </button>
                      <button onClick={() => setDeletando(e.id)}
                        className="flex-1 flex flex-col items-center justify-center px-4 gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#9B8B7A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs" style={{ color: '#9B8B7A' }}>Apagar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <Link href="/estadia/nova"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-3xl"
            style={{ border: '1.5px dashed #3A2E22', background: 'transparent' }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#2A2118' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#C4823A" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#C4823A' }}>Novo planejamento</span>
          </Link>
        </div>
      )}
    </main>
  )
}
