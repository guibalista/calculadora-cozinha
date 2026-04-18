'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CadastroPage() {
  const router = useRouter()
  const [nomeCasa, setNomeCasa] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCadastro(e: React.SyntheticEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { data, error } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome_casa: nomeCasa } }
    })
    if (error) {
      setErro('Erro ao criar conta: ' + error.message)
    } else if (data.user) {
      router.push('/dashboard')
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-sm mx-auto w-full justify-center" style={{ background: '#F0F7F2' }}>
      <Link href="/" className="text-xl font-bold tracking-tight mb-10 block" style={{ color: '#1A2E25' }}>Despensa</Link>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A2E25' }}>Criar conta</h1>
      <p className="text-sm mb-8" style={{ color: '#5A7A68' }}>Cadastre sua casa ou pousada</p>

      <form onSubmit={handleCadastro} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2E25' }}>Nome da casa ou pousada</label>
          <input
            type="text" value={nomeCasa} onChange={e => setNomeCasa(e.target.value)}
            placeholder="Ex: Casa Trancoso, Villa Mar" required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#fff', color: '#1A2E25' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2E25' }}>E-mail</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com" required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#fff', color: '#1A2E25' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2E25' }}>Senha</label>
          <input
            type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Mínimo 8 caracteres" minLength={8} required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none"
            style={{ border: '1.5px solid #C8E4D4', background: '#fff', color: '#1A2E25' }}
          />
        </div>

        {erro && <p className="text-sm px-4 py-3 rounded-2xl" style={{ background: '#FEF2F2', color: '#C13515' }}>{erro}</p>}

        <button
          type="submit" disabled={carregando}
          className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-50"
          style={{ background: '#128C7E', color: '#fff' }}
        >
          {carregando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: '#5A7A68' }}>
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold underline" style={{ color: '#128C7E' }}>Entrar</Link>
      </p>
    </main>
  )
}
