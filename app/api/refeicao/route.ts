import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { nome, homens, mulheres, criancas } = await req.json()
  if (!nome || typeof nome !== 'string') {
    return NextResponse.json({ error: 'nome obrigatorio' }, { status: 400 })
  }

  const total = (homens || 0) + (mulheres || 0) + (criancas || 0)
  const perfil = [
    homens > 0 ? `${homens} homem${homens > 1 ? 'ens' : ''}` : '',
    mulheres > 0 ? `${mulheres} mulher${mulheres > 1 ? 'es' : ''}` : '',
    criancas > 0 ? `${criancas} criança${criancas > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ')

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Você é especialista em cardápios para casas de aluguel de temporada no Brasil (Airbnb, casas de praia).

Grupo: ${total} pessoas (${perfil})
Contexto: cozinha doméstica, não restaurante.

Para a refeição "${nome}", retorne APENAS um JSON válido:
{
  "nome": "<nome formatado da refeição>",
  "ingredientes": [
    {
      "nome": "<ingrediente>",
      "gramasPorPessoa": <inteiro — gramas crus por pessoa adulta>,
      "categoria": <"proteina" | "vegetal" | "fruta" | "carboidrato" | "laticinios" | "tempero" | "bebida" | "padaria">
    }
  ]
}

Regras:
- Máximo 8 ingredientes
- gramasPorPessoa = quantidade crua por adulto (a proporção para mulheres -20% e crianças -50% é calculada automaticamente)
- Use ingredientes de supermercado brasileiro
- Inclua temperos básicos (alho, sal, cebola) quando pertinente
- Porcões domésticas, não de restaurante profissional

Responda APENAS o JSON, sem texto adicional.`
      }]
    })

    const texto = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const dados = JSON.parse(texto)

    if (!dados.nome || !Array.isArray(dados.ingredientes) || dados.ingredientes.length === 0) {
      throw new Error('resposta incompleta')
    }

    return NextResponse.json(dados)
  } catch {
    return NextResponse.json({ error: 'falha ao identificar refeicao' }, { status: 500 })
  }
}
