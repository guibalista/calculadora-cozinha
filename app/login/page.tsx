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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos. Tente novamente.')
    } else {
      router.push('/dashboard')
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-[#c8783a]">CozinhaPro</h1>
          <p className="text-[#8a7f74] text-sm mt-1">Entre na sua conta</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5e0d8]">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#c8783a] text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-60 active:bg-[#a85e28] transition-colors"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8a7f74] mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-[#c8783a] font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
