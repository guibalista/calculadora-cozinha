'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function Contador({ label, sublabel, value, onChange }: {
  label: string; sublabel: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #E4F2EA' }}>
      <div>
        <p className="font-medium text-base" style={{ color: '#1A2E25' }}>{label}</p>
        <p className="text-sm" style={{ color: '#5A7A68' }}>{sublabel}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ border: '1.5px solid #C8E4D4', color: '#1A2E25', background: '#fff' }}>−</button>
        <span className="w-6 text-center font-semibold text-lg" style={{ color: '#1A2E25' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: '#128C7E', color: '#fff' }}>+</button>
      </div>
    </div>
  )
}

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

export default function NovaReceitaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [tipoEvento, setTipoEvento] = useState('churrasco')
  const [data, setData] = useState('')
  const [homens, setHomens] = useState(0)
  const [mulheres, setMulheres] = useState(0)
  const [criancas, setCriancas] = useState(0)

  const total = homens + mulheres + criancas
  const podeCriar = nome && total > 0

  function criar() {
    if (!podeCriar) return
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]')
    const novo = {
      id: Date.now().toString(),
      nome, tipoEvento, data, homens, mulheres, criancas, totalPessoas: total,
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
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>Nome do evento</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Ex: Casamento Silva, Churrasco de fim de ano"
            className="w-full px-4 py-3 rounded-2xl text-base outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        </div>

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

        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>
            Data do evento <span style={{ color: '#7BA892' }}>(opcional)</span>
          </label>
          <input type="date" value={data} onChange={e => setData(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        </div>

        <div className="bg-white rounded-3xl px-5 pb-2" style={{ border: '1.5px solid #D4EDE0' }}>
          <p className="font-semibold text-base pt-5 mb-1" style={{ color: '#1A2E25' }}>Número de convidados</p>
          <p className="text-sm pb-2" style={{ color: '#5A7A68' }}>Para calcular quantidades e custo por pessoa</p>
          <Contador label="Homens" sublabel="Porção completa" value={homens} onChange={setHomens} />
          <Contador label="Mulheres" sublabel="Porção reduzida" value={mulheres} onChange={setMulheres} />
          <Contador label="Crianças" sublabel="Meia porção" value={criancas} onChange={setCriancas} />
          {total > 0 && (
            <p className="text-sm py-4 font-medium" style={{ color: '#7BA892' }}>
              {total} convidado{total > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <button onClick={criar} disabled={!podeCriar}
        className="w-full mt-6 py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#128C7E', color: '#fff' }}>
        Criar evento e montar cardápio
      </button>
    </main>
  )
}
