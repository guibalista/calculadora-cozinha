'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        if (error.code === 'email_not_confirmed') {
          setErro('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
        } else {
          setErro(error.message)
        }
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setErro(String(err))
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 max-w-sm mx-auto w-full justify-center" style={{ background: '#1C1712' }}>
      <Link href="/" className="text-xl font-bold tracking-tight mb-10 block" style={{ color: '#F2EBE0' }}>Despensa</Link>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#F2EBE0' }}>Bem-vindo de volta</h1>
      <p className="text-sm mb-8" style={{ color: '#9B8B7A' }}>Entre na sua conta</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#F2EBE0' }}>E-mail</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com" required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none"
            style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#F2EBE0' }}>Senha</label>
          <input
            type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="••••••••" required
            className="w-full px-4 py-3.5 rounded-2xl border text-base outline-none"
            style={{ border: '1.5px solid #3A2E22', background: '#252015', color: '#F2EBE0' }}
          />
        </div>

        {erro && <p className="text-sm px-4 py-3 rounded-2xl" style={{ background: '#2A1810', color: '#C13515' }}>{erro}</p>}

        <button
          type="submit" disabled={carregando}
          className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-50"
          style={{ background: '#C4823A', color: '#fff' }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: '#9B8B7A' }}>
        Não tem conta?{' '}
        <Link href="/cadastro" className="font-semibold underline" style={{ color: '#C4823A' }}>Criar conta</Link>
      </p>
    </main>
  )
}
