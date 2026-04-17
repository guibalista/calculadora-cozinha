import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">

        <div className="mb-8">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-[#c8783a] mb-2">CozinhaPro</h1>
          <p className="text-[#8a7f74] text-base leading-relaxed">
            Calculadora inteligente de receitas para casas de temporada e pousadas
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-[#c8783a] text-white font-semibold py-4 px-6 rounded-2xl text-center text-lg active:bg-[#a85e28] transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="block w-full border-2 border-[#c8783a] text-[#c8783a] font-semibold py-4 px-6 rounded-2xl text-center text-lg active:bg-orange-50 transition-colors"
          >
            Criar conta
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e0d8]">
            <div className="text-2xl mb-1">⚖️</div>
            <p className="text-xs text-[#8a7f74] font-medium">Sem desperdício</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e0d8]">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-[#8a7f74] font-medium">Custos precisos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e0d8]">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-xs text-[#8a7f74] font-medium">Lista organizada</p>
          </div>
        </div>
      </div>
    </main>
  )
}
