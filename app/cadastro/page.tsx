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

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome_casa: nomeCasa }
      }
    })

    if (error) {
      setErro('Erro ao criar conta: ' + error.message)
    } else if (data.user) {
      router.push('/dashboard')
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-[#c8783a]">Criar conta</h1>
          <p className="text-[#8a7f74] text-sm mt-1">Cadastre sua casa ou pousada</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e5e0d8]">
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Nome da casa / pousada</label>
              <input
                type="text"
                value={nomeCasa}
                onChange={e => setNomeCasa(e.target.value)}
                placeholder="Ex: Casa Trancoso, Pousada Sol"
                required
                className="w-full border border-[#e5e0d8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#c8783a] bg-[#f9f7f4]"
              />
            </div>
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
                placeholder="Mínimo 8 caracteres"
                minLength={8}
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
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8a7f74] mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#c8783a] font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
