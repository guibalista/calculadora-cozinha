import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-10" style={{ background: '#1C1712' }}>

      <div className="flex items-center gap-2 mb-auto">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C4823A' }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#C4823A', fontFamily: 'var(--font-sans)' }}>
          Despensa
        </span>
      </div>

      <div className="flex flex-col justify-center flex-1 py-16">
        <h1
          className="text-5xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.02em' }}
        >
          <span style={{ color: '#F2EBE0' }}>Planeje</span>
          <br />
          <span className="italic" style={{ color: '#C4823A' }}>sem</span>
          <br />
          <span style={{ color: '#F2EBE0' }}>desperdício.</span>
        </h1>
        <p className="text-base leading-relaxed max-w-xs" style={{ color: '#9B8B7A' }}>
          Para casas de aluguel, pousadas e eventos.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3 mb-4">
        <Link
          href="/cadastro"
          className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: '#C4823A', color: '#fff' }}
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
          style={{ border: '1.5px solid #3A2E22', color: '#C4823A', background: '#252015' }}
        >
          Entrar
        </Link>
      </div>

    </main>
  )
}
