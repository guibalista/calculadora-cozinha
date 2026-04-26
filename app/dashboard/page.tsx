'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Estadia {
  id: string; nome: string
  homens: number; mulheres: number; criancas: number
  numero_dias: number; data_inicio?: string; data_fim?: string
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

export default function DashboardPage() {
  const [estadias, setEstadias] = useState<Estadia[]>([])
  const [deletando, setDeletando] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('estadias')
        .select('id, nome, homens, mulheres, criancas, numero_dias, data_inicio, data_fim')
        .order('created_at', { ascending: false })
      setEstadias(data ?? [])
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
    }).select('id, nome, homens, mulheres, criancas, numero_dias, data_inicio, data_fim').single()
    if (inserido) setEstadias(prev => [inserido as Estadia, ...prev])
  }

  const total = estadias.length

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-5 py-8" style={{ background: '#F0F7F2' }}>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium mb-0.5 capitalize" style={{ color: '#7BA892' }}>{dataHoje()}</p>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: '#1A2E25' }}>{saudacao()}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5A7A68' }}>
            {carregando ? 'Carregando...' : total === 0 ? 'Nenhum planejamento ainda' : `${total} planejamento${total !== 1 ? 's' : ''} salvo${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={sair}
            className="px-3 py-3 rounded-2xl text-sm font-medium"
            style={{ border: '1.5px solid #D4EDE0', color: '#7BA892', background: '#fff' }}>
            Sair
          </button>
          <Link href="/estadia/nova"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#128C7E', color: '#fff' }}>
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
            style={{ borderColor: '#128C7E', borderTopColor: 'transparent' }} />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl mb-5 flex items-center justify-center" style={{ background: '#E8F5EE' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#128C7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="#128C7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: '#1A2E25' }}>Pronto para planejar</p>
          <p className="text-sm mb-6" style={{ color: '#5A7A68' }}>Crie seu primeiro planejamento</p>
          <Link href="/estadia/nova"
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#128C7E', color: '#fff' }}>
            Criar planejamento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {estadias.map((e) => {
            const totalP = e.homens + e.mulheres + e.criancas
            const partes = [
              e.homens > 0 ? `${e.homens}H` : '',
              e.mulheres > 0 ? `${e.mulheres}M` : '',
              e.criancas > 0 ? `${e.criancas}C` : '',
            ].filter(Boolean).join(' ')

            return (
              <div key={e.id} className="flex flex-col justify-between p-4 rounded-3xl relative"
                style={{ background: '#fff', border: deletando === e.id ? '1.5px solid #E8A090' : '1.5px solid #D4EDE0', minHeight: 120 }}>
                {deletando === e.id ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-2">
                    <p className="text-xs font-semibold text-center" style={{ color: '#1A2E25' }}>Apagar planejamento?</p>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => setDeletando(null)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold"
                        style={{ border: '1.5px solid #D4EDE0', color: '#5A7A68' }}>Cancelar</button>
                      <button onClick={() => deletar(e.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: '#E8A090', color: '#fff' }}>Apagar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Link href={`/estadia/${e.id}`} className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate" style={{ color: '#1A2E25' }}>{e.nome}</p>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => duplicar(e.id)}
                          className="opacity-30 hover:opacity-70"
                          title="Duplicar">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="#5A7A68" strokeWidth="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#5A7A68" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeletando(e.id)}
                          className="text-base leading-none opacity-30 hover:opacity-70"
                          style={{ color: '#5A7A68' }}>×</button>
                      </div>
                    </div>
                    <Link href={`/estadia/${e.id}`}>
                      <p className="text-xs font-medium mb-1" style={{ color: '#128C7E' }}>{periodo(e)}</p>
                      <p className="text-xs" style={{ color: '#7BA892' }}>
                        {totalP} hóspede{totalP !== 1 ? 's' : ''}
                        {partes ? ` · ${partes}` : ''}
                      </p>
                    </Link>
                  </>
                )}
              </div>
            )
          })}

          <Link href="/estadia/nova"
            className="flex flex-col items-center justify-center p-4 rounded-3xl"
            style={{ border: '1.5px dashed #C8E4D4', background: 'transparent', minHeight: 120 }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: '#E8F5EE' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#128C7E" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-xs font-semibold text-center" style={{ color: '#128C7E' }}>Novo planejamento</p>
          </Link>
        </div>
      )}
    </main>
  )
}
