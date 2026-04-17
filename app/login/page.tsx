'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('Email ou senha incorretos.')
    else router.push('/dashboard')
    setCarregando(false)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-sm mx-auto w-full justify-center" style={{ background: '#F7F5F2' }}>
      <Link href="/" className="text-xl font-bold tracking-tight mb-10 block" style={{ color: '#222' }}>despensa</Link>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Bem-vindo de volta</h1>
      <p className="text-sm mb-8" style={{ color: '#717171' }}>Entre na sua conta</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#222' }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com" required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none transition-colors"
            style={{ border: '1.5px solid #DDDDDD', background: '#fff', color: '#222' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#222' }}>Senha</label>
          <input
            type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="••••••••" required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none"
            style={{ border: '1.5px solid #DDDDDD', background: '#fff', color: '#222' }}
          />
        </div>

        {erro && <p className="text-sm px-4 py-3 rounded-2xl" style={{ background: '#FEF2F2', color: '#C13515' }}>{erro}</p>}

        <button
          type="submit" disabled={carregando}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-opacity disabled:opacity-50"
          style={{ background: '#222', color: '#fff' }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: '#717171' }}>
        Não tem conta?{' '}
        <Link href="/cadastro" className="font-semibold underline" style={{ color: '#222' }}>Criar conta</Link>
      </p>
    </main>
  )
}
