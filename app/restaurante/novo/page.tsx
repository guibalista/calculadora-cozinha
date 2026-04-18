'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TIPOS = [
  { key: 'restaurante', label: 'Restaurante' },
  { key: 'bar', label: 'Bar' },
  { key: 'bistro', label: 'Bistrô' },
  { key: 'lanchonete', label: 'Lanchonete' },
  { key: 'pizzaria', label: 'Pizzaria' },
  { key: 'delivery', label: 'Delivery' },
]

export default function NovoRestaurantePage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('restaurante')

  function criar() {
    if (!nome.trim()) return
    const lista = JSON.parse(localStorage.getItem('restaurantes') || '[]')
    const novo = { id: Date.now().toString(), nome: nome.trim(), tipo, pratos: [], precos: [] }
    lista.push(novo)
    localStorage.setItem('restaurantes', JSON.stringify(lista))
    router.push(`/restaurante/${novo.id}`)
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#F0F7F2' }}>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-medium" style={{ color: '#128C7E' }}>← Voltar</Link>
      </div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A2E25' }}>Novo restaurante</h1>
      <p className="text-sm mb-8" style={{ color: '#5A7A68' }}>Configure seu estabelecimento</p>

      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A2E25' }}>Nome do estabelecimento</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Ex: Restaurante da Praia, Bar do João"
            className="w-full px-4 py-3 rounded-2xl text-base outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#F5FAF7', color: '#1A2E25' }} />
        </div>

        <div className="bg-white rounded-3xl p-5" style={{ border: '1.5px solid #D4EDE0' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#1A2E25' }}>Tipo de estabelecimento</p>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS.map(t => (
              <button key={t.key} onClick={() => setTipo(t.key)}
                className="py-3 rounded-2xl text-sm font-medium"
                style={tipo === t.key
                  ? { background: '#128C7E', color: '#fff' }
                  : { background: '#F5FAF7', color: '#5A7A68', border: '1.5px solid #D4EDE0' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={criar} disabled={!nome.trim()}
        className="w-full mt-6 py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
        style={{ background: '#128C7E', color: '#fff' }}>
        Criar e montar cardápio
      </button>
    </main>
  )
}
