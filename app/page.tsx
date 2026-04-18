import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#F0F7F2' }}>

      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <span className="text-xl font-bold tracking-tight" style={{ color: '#1A2E25' }}>despensa</span>
        <Link href="/login" className="text-sm font-medium underline" style={{ color: '#128C7E' }}>Entrar</Link>
      </header>

      <section className="flex-1 flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#7BA892' }}>Para casas de temporada e chefs</p>
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#1A2E25' }}>
            Planeje. Calcule.<br />Sem desperdício.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#5A7A68' }}>
            Monte o cardápio, informe os hóspedes e receba a lista de compras exata — com fatores de correção e cocção automáticos.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {[
            { icon: '🏠', title: 'Planejar estadia', desc: 'Cardápio dia a dia + lista de compras consolidada' },
            { icon: '🍽️', title: 'Planejar receita', desc: 'Monte o cardápio de um evento ou refeição avulsa' },
            { icon: '⚖️', title: 'Quantidades exatas', desc: 'FC e fator de cocção aplicados automaticamente' },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-3 p-4 rounded-2xl bg-white" style={{ border: '1.5px solid #D4EDE0' }}>
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1A2E25' }}>{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5A7A68' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            href="/cadastro"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
            style={{ background: '#128C7E', color: '#fff' }}
          >
            Começar agora — é grátis
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
            style={{ border: '1.5px solid #C8E4D4', color: '#128C7E', background: '#fff' }}
          >
            Já tenho conta
          </Link>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#7BA892' }}>
          Para casas de temporada em Trancoso e além
        </p>
      </section>
    </main>
  )
}
