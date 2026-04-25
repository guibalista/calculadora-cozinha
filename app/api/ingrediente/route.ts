import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { nome } = await req.json()
  if (!nome || typeof nome !== 'string') {
    return NextResponse.json({ error: 'nome obrigatorio' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Você é especialista em planejamento de refeições para casas de aluguel de temporada no Brasil (como Airbnb, casas em Trancoso, chalés).

O contexto é: família ou grupo de amigos em férias, cozinha doméstica, não restaurante profissional.

Para o ingrediente "${nome}", retorne APENAS um JSON válido:
{
  "percapitaGramas": <inteiro - gramas cruas por pessoa adulta numa refeição doméstica casual>,
  "fatorCorrecao": <decimal - fator de perda para compra doméstica. Cortes limpos = 1.05-1.15. Vegetais = 1.10-1.25. Peixes inteiros = 1.40-1.60. Nunca acima de 1.80>,
  "categoria": <"proteina" | "vegetal" | "fruta" | "carboidrato" | "laticinios" | "tempero" | "bebida" | "padaria">
}

Exemplos de referência doméstica:
- Frango filé: 200g, FC 1.15
- Picanha: 280g, FC 1.20
- Queijo gouda: 50g, FC 1.00
- Arroz: 80g, FC 1.00
- Abobrinha: 100g, FC 1.10

Responda APENAS o JSON, sem texto adicional.`
      }]
    })

    const texto = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const dados = JSON.parse(texto)

    if (!dados.percapitaGramas || !dados.fatorCorrecao || !dados.categoria) {
      throw new Error('resposta incompleta')
    }

    return NextResponse.json({ ...dados, nome })
  } catch {
    return NextResponse.json({ error: 'falha na classificacao' }, { status: 500 })
  }
}
