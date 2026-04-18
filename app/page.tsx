import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F0F7F2' }}>

      {/* Logo centralizado */}
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4" style={{ color: '#1A2E25', letterSpacing: '-0.03em' }}>
          Despensa
        </h1>
        <p className="text-base max-w-xs leading-relaxed" style={{ color: '#5A7A68' }}>
          Planeje e calcule refeições<br />sem desperdício.
        </p>
      </div>

      {/* Botões */}
      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/cadastro"
          className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: '#128C7E', color: '#fff' }}
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-base"
          style={{ border: '1.5px solid #C8E4D4', color: '#128C7E', background: '#fff' }}
        >
          Entrar
        </Link>
      </div>

    </main>
  )
}
