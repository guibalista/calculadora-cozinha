import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { texto, nome } = await req.json()
  if (!texto || typeof texto !== 'string') {
    return NextResponse.json({ error: 'texto obrigatorio' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Você é um sistema de extração de dados culinários para lista de compras brasileira.

Texto da receita: "${texto}"
${nome ? `Nome sugerido: "${nome}"` : ''}

Extraia os ingredientes e retorne APENAS um JSON válido:
{
  "nome": "<nome da receita em português>",
  "ingredientes": [
    { "nome": "<Ingrediente>", "gramasPorPessoa": <inteiro>, "categoria": "<categoria>" }
  ]
}

Regras obrigatórias:
- gramasPorPessoa = gramas brutas cruas por pessoa adulta para uma refeição (peso de compra)
- Se o texto der quantidades totais (ex: "500g para 4 pessoas"), divida pela quantidade de pessoas
- Se não especificar quantidade, use porções típicas da culinária brasileira
- categoria: proteina | vegetal | fruta | carboidrato | laticinios | tempero | bebida | padaria
- Incluir no mínimo 3 e no máximo 12 ingredientes principais
- Nomes em português, capitalizados (ex: "Frango peito s/ osso", "Azeite de oliva")
- Não incluir água

Responda APENAS o JSON, sem texto adicional.`,
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'parse error' }, { status: 500 })

    const dados = JSON.parse(jsonMatch[0])
    if (!dados.nome || !Array.isArray(dados.ingredientes) || dados.ingredientes.length === 0) {
      return NextResponse.json({ error: 'resposta invalida' }, { status: 500 })
    }

    return NextResponse.json(dados)
  } catch {
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}
