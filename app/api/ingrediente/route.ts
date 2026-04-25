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
        content: `Você é um especialista em gastronomia brasileira e ficha técnica de cozinha profissional.

Para o ingrediente "${nome}", retorne APENAS um JSON válido com este formato exato:
{
  "percapitaGramas": <número inteiro - gramas por pessoa adulta em uma refeição principal>,
  "fatorCorrecao": <número decimal - fator FC para compra considerando perdas e aparas, ex: 1.25>,
  "categoria": <uma das opções: "proteina", "vegetal", "fruta", "carboidrato", "laticinios", "tempero", "bebida", "padaria">
}

Regras:
- percapitaGramas: quantidade crua por pessoa em uma refeição (não aperitivo)
- fatorCorrecao: quanto comprar a mais por perdas (1.00 = sem perda, 1.30 = 30% de perda)
- Use conhecimento técnico de cozinha profissional brasileira
- Responda APENAS o JSON, sem texto adicional`
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
