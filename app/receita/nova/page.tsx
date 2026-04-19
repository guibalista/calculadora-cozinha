'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TIPOS_EVENTO = [
  { key: 'churrasco', label: 'Churrasco' },
  { key: 'casamento', label: 'Casamento' },
  { key: 'formatura', label: 'Formatura' },
  { key: 'aniversario', label: 'Aniversário' },
  { key: 'corporativo', label: 'Corporativo' },
  { key: 'almoco', label: 'Almoço' },
  { key: 'jantar', label: 'Jantar' },
  { key: 'brunch', label: 'Brunch' },
  { key: 'outro', label: 'Outro' },
]

const DURACOES = [
  { key: 'coquetel', label: 'Coquetel', desc: 'até 2h' },
  { key: 'tarde', label: 'Tarde', desc: '4h' },
  { key: 'noite', label: 'Noite', desc: '6h' },
  { key: 'dia', label: 'Dia inteiro', desc: '8h+' },
]

const PERFIS = [
  { key: 'leve', label: 'Leve', desc: 'Pouco apetite, finger food' },
  { key: 'moderado', label: 'Moderado', desc: 'Consumo padrão' },
  { key: 'intenso', label: 'Intenso', desc: 'Muito apetite, churrasco' },
]

export default function NovaReceitaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [tipoEvento, setTipoEvento] = useState('churrasco')
  const [data, setData] = useState('')
  const [totalPessoas, setTotalPessoas] = useState(20)
  const [duracao, setDuracao] = useState('tarde')
  const [perfilConsumo, setPerfilConsumo] = useState('moderado')

  const podeCriar = nome.trim() && totalPessoas > 0

  function criar() {
    if (!podeCriar) return
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const novo = {
      id: Date.now().toString(),
      nome: nome.trim(), tipoEvento, data,
      totalPessoas, duracao, perfilConsumo,
      // mantém compatibilidade com módulo antigo
      homens: 0, mulheres: 0, criancas: 0,
      refeicoes: [], precos: [], precoVenda: 0,
    }
    eventos.push(novo)
    localStorage.setItem('eventos', JSON.stringify(eventos))
    router.push(`/receita/${novo.id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium" style={{ color: '#128C7E' }}>← Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A2E25' }}>Novo evento</h1>
      <p className="text-sm mb-8" style={{ color: '#5A7A68' }}>Cardápio, compras e financeiro em um só lugar</p>

      <div className="space-y-4">

        {/* Nome */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>Nome do evento</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Ex: Casamento Silva, Churrasco de fim de ano"
            className="w-full px-4 py-3 rounded-2xl text-base outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        </div>

        {/* Tipo */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#1A2E25' }}>Tipo de evento</p>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_EVENTO.map(t => (
              <button key={t.key} onClick={() => setTipoEvento(t.key)}
                className="py-2.5 rounded-2xl text-sm font-medium"
                style={tipoEvento === t.key
                  ? { background: '#128C7E', color: '#fff' }
                  : { background: '#F5FAF7', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total de pessoas */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: '#1A2E25' }}>Total de convidados</p>
            <span className="text-2xl font-bold" style={{ color: '#128C7E' }}>{totalPessoas}</span>
          </div>
          <input type="range" min="5" max="500" step="5" value={totalPessoas}
            onChange={e => setTotalPessoas(parseInt(e.target.value))}
            className="w-full" style={{ accentColor: '#128C7E' }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#7BA892' }}>
            <span>5</span><span>100</span><span>250</span><span>500</span>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {[10, 20, 50, 80, 100, 150, 200].map(n => (
              <button key={n} onClick={() => setTotalPessoas(n)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium"
                style={totalPessoas === n
                  ? { background: '#128C7E', color: '#fff' }
                  : { background: '#F5FAF7', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Duração */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#1A2E25' }}>Duração do evento</p>
          <div className="grid grid-cols-2 gap-2">
            {DURACOES.map(d => (
              <button key={d.key} onClick={() => setDuracao(d.key)}
                className="py-3 rounded-2xl text-left px-4"
                style={duracao === d.key
                  ? { background: '#128C7E', color: '#fff' }
                  : { background: '#F5FAF7', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="text-xs mt-0.5" style={{ color: duracao === d.key ? 'rgba(255,255,255,0.7)' : '#7BA892' }}>{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Perfil de consumo */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#1A2E25' }}>Perfil de consumo</p>
          <div className="space-y-2">
            {PERFIS.map(p => (
              <button key={p.key} onClick={() => setPerfilConsumo(p.key)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left"
                style={perfilConsumo === p.key
                  ? { background: '#128C7E', color: '#fff' }
                  : { background: '#F5FAF7', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
                <span className="font-semibold text-sm">{p.label}</span>
                <span className="text-xs" style={{ color: perfilConsumo === p.key ? 'rgba(255,255,255,0.7)' : '#7BA892' }}>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>
            Data do evento <span style={{ color: '#7BA892' }}>(opcional)</span>
          </label>
          <input type="date" value={data} onChange={e => setData(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        </div>
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full mt-6 py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#128C7E', color: '#fff' }}>
        Criar evento e montar cardápio →
      </button>
    </main>
  )
}
