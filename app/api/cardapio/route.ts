import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { homens, mulheres, criancas, numeroDias, diasJaPlaneados } = await req.json()
  if (typeof homens !== 'number') {
    return NextResponse.json({ error: 'dados invalidos' }, { status: 400 })
  }

  const totalPessoas = homens + mulheres + criancas
  const perfil = [
    homens > 0 ? `${homens} homem${homens > 1 ? 'ens' : ''}` : '',
    mulheres > 0 ? `${mulheres} mulher${mulheres > 1 ? 'es' : ''}` : '',
    criancas > 0 ? `${criancas} criança${criancas > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ')

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é especialista em cardápios para casas de aluguel de temporada no Brasil (Airbnb, casas de praia, chalés).

Grupo: ${totalPessoas} pessoas (${perfil})
Estadia: ${numeroDias} dia${numeroDias > 1 ? 's' : ''}
${diasJaPlaneados > 0 ? `Dias já planejados: ${diasJaPlaneados}` : 'Nenhum dia planejado ainda'}

Sugira 6 refeições variadas e práticas para esta estadia. Misture café da manhã, almoço e jantar. Considere o contexto de férias em casa alugada — refeições gostosas mas sem complicação excessiva.

Retorne APENAS um JSON válido:
[
  {
    "nome": "nome da refeição",
    "tipo": "cafe" | "almoco" | "jantar" | "lanche",
    "ingredientes": [
      { "nome": "ingrediente", "gramasPorPessoa": <inteiro>, "categoria": "proteina" | "vegetal" | "fruta" | "carboidrato" | "laticinios" | "tempero" | "bebida" | "padaria" }
    ]
  }
]

Máximo 6 ingredientes por refeição. Use ingredientes comuns e fáceis de encontrar no Brasil. Gramas são crus, por pessoa adulta.

Responda APENAS o JSON, sem texto adicional.`
      }]
    })

    const texto = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const sugestoes = JSON.parse(texto)
    return NextResponse.json({ sugestoes })
  } catch {
    return NextResponse.json({ error: 'falha ao gerar cardapio' }, { status: 500 })
  }
}
