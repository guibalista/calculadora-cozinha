import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-md mx-auto">

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Olá! 👋</h1>
        <p className="text-[#8a7f74] text-sm mt-1">O que vamos preparar hoje?</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/calculadora" className="bg-[#c8783a] text-white rounded-3xl p-5 flex flex-col gap-2 active:opacity-80 transition-opacity shadow-md">
          <span className="text-3xl">🧮</span>
          <span className="font-bold text-base leading-tight">Nova Calculadora</span>
          <span className="text-xs text-orange-100">Calcular receita agora</span>
        </Link>
        <Link href="/receitas" className="bg-white rounded-3xl p-5 flex flex-col gap-2 active:opacity-80 transition-opacity shadow-sm border border-[#e5e0d8]">
          <span className="text-3xl">📖</span>
          <span className="font-bold text-base text-[#1a1a1a] leading-tight">Minhas Receitas</span>
          <span className="text-xs text-[#8a7f74]">Ver e editar receitas</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/lista-compras" className="bg-white rounded-3xl p-5 flex flex-col gap-2 active:opacity-80 transition-opacity shadow-sm border border-[#e5e0d8]">
          <span className="text-3xl">🛒</span>
          <span className="font-bold text-base text-[#1a1a1a] leading-tight">Lista de Compras</span>
          <span className="text-xs text-[#8a7f74]">Ver lista gerada</span>
        </Link>
        <Link href="/precos" className="bg-white rounded-3xl p-5 flex flex-col gap-2 active:opacity-80 transition-opacity shadow-sm border border-[#e5e0d8]">
          <span className="text-3xl">💰</span>
          <span className="font-bold text-base text-[#1a1a1a] leading-tight">Preços</span>
          <span className="text-xs text-[#8a7f74]">Gestão de custos</span>
        </Link>
      </div>

      <div className="bg-[#fff8f0] rounded-3xl p-5 border border-[#f0d4b8]">
        <h2 className="font-bold text-[#c8783a] mb-3">Última calculada</h2>
        <p className="text-sm text-[#8a7f74]">Nenhuma receita calculada ainda. Comece agora! 🚀</p>
      </div>
    </main>
  )
}
