import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#F7F5F2' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#222' }}>despensa</span>
        <Link href="/login" className="text-sm font-medium underline" style={{ color: '#222' }}>Entrar</Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#9B8B7A' }}>Para casas de temporada e chefs</p>
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#222' }}>
            Planeje. Calcule.<br />Sem desperdício.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#717171' }}>
            Monte o cardápio por dia, informe os hóspedes e receba a lista de compras exata — com fatores de correção e cocção automáticos.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {[
            { icon: '🏠', title: 'Planejar estadia', desc: 'Cardápio dia a dia + lista de compras consolidada' },
            { icon: '🧮', title: 'Calculadora de receitas', desc: 'Custo real, markup e preço de venda por pessoa' },
            { icon: '⚖️', title: 'Fatores automáticos', desc: 'FC e fator de cocção aplicados sem que você precise saber' },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-3 p-4 rounded-2xl bg-white" style={{ border: '1.5px solid #EBEBEB' }}>
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#222' }}>{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#717171' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            href="/cadastro"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
            style={{ background: '#222', color: '#fff' }}
          >
            Começar agora — é grátis
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base border"
            style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}
          >
            Já tenho conta
          </Link>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#BBBBBB' }}>
          Para casas de temporada em Trancoso e além
        </p>
      </section>
    </main>
  )
}
