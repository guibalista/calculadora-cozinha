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
      <section className="flex-1 flex flex-col justify-center px-6 py-12 max-w-sm mx-auto w-full">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#9B8B7A' }}>Para casas de temporada</p>
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#222' }}>
            Planeje a semana.<br />Sem desperdício.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#717171' }}>
            Monte o cardápio por dia, informe os hóspedes e receba a lista de compras pronta.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/cadastro"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base transition-opacity active:opacity-80"
            style={{ background: '#222', color: '#fff' }}
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base border transition-opacity active:opacity-80"
            style={{ border: '1.5px solid #DDDDDD', color: '#222', background: '#fff' }}
          >
            Já tenho conta
          </Link>
        </div>

        {/* Benefícios */}
        <div className="mt-12 space-y-4">
          {[
            { icon: '👤', text: 'Calcula por homem, mulher e criança' },
            { icon: '📅', text: 'Planeja dia a dia com convidados extras' },
            { icon: '🛒', text: 'Gera lista de compras da semana inteira' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-4">
              <span className="text-xl w-8 text-center">{b.icon}</span>
              <span className="text-sm" style={{ color: '#717171' }}>{b.text}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
