import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { nome, receitaNome } = await req.json()
  if (!nome || typeof nome !== 'string') {
    return NextResponse.json({ error: 'nome obrigatorio' }, { status: 400 })
  }

  const contextoReceita = receitaNome
    ? `\nRECEITA SENDO PREPARADA: "${receitaNome}"\nCalibrar a quantidade de "${nome}" para o papel específico que desempenha NESTA receita. Exemplo: tomate em hambúrguer = 30g (fatia); tomate em molho bolonhesa = 80g (base do molho).`
    : ''

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Você é especialista em gastronomia e planejamento de refeições para casas de aluguel de temporada no Brasil (Airbnb, Trancoso, chalés).

Contexto: família ou grupo de amigos em férias, cozinha doméstica, não restaurante profissional.${contextoReceita}

Para o ingrediente "${nome}", retorne APENAS um JSON válido:
{
  "percapitaGramas": <inteiro - gramas cruas por pessoa adulta nesta preparação específica>,
  "fatorCorrecao": <decimal - fator de perda para compra. Cortes limpos = 1.05-1.15. Vegetais = 1.10-1.25. Peixes inteiros = 1.40-1.60. Nunca acima de 1.80>,
  "categoria": <"proteina" | "vegetal" | "fruta" | "carboidrato" | "laticinios" | "tempero" | "bebida" | "padaria">
}

Referências de quantidade por pessoa (prato principal doméstico):
- Massas (penne, rigatoni, espaguete, fettuccine): 90-100g cru
- Frango filé (prato principal): 200g, FC 1.15
- Picanha / carne: 250-300g, FC 1.20
- Peixe filé: 200g, FC 1.10
- Camarão limpo: 200g, FC 1.05
- Arroz: 80g, FC 1.00
- Queijo (recheio/molho): 40-60g, FC 1.00
- Legumes (acompanhamento): 80-100g, FC 1.15
- Temperos (alho, sal, etc.): 5-15g, FC 1.00

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
