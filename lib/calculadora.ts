import { tabelaAlimentos, CENARIOS, MARKUP_PADRAO, type CenarioNome } from './fatores-correcao'

export interface IngredienteReceita {
  id: string
  nome: string
  quantidadeLiquidaKg: number  // quantidade líquida na receita original (kg ou litro)
  precoUnitario: number        // preço por kg/litro
  fatorCorrecao: number
  fatorCoccao: number
  categoria: string
}

export interface ResultadoIngrediente {
  nome: string
  categoria: string
  pesoBrutoPorPessoa: number
  pesoLiquidoPorPessoa: number
  pesoPoscoccaoPorPessoa: number
  pesoBrutoTotal: number
  pesoLiquidoTotal: number
  pesoPoscoccaoTotal: number
  custoTotal: number
}

export interface ResultadoCenario {
  cenario: CenarioNome
  label: string
  cor: string
  numeroPessoas: number
  ingredientes: ResultadoIngrediente[]
  custoTotalReceita: number
  custoPorPessoa: number
  precoVendaSugerido: number
  markup: number
}

export interface ReceitaInput {
  nome: string
  porcoes: number             // número de porções da receita original
  ingredientes: IngredienteReceita[]
  markupPersonalizado?: number
}

export function calcularReceita(receita: ReceitaInput, numeroPessoas: number): Record<CenarioNome, ResultadoCenario> {
  const markup = receita.markupPersonalizado ?? MARKUP_PADRAO
  const resultado = {} as Record<CenarioNome, ResultadoCenario>

  for (const [key, cenario] of Object.entries(CENARIOS) as [CenarioNome, typeof CENARIOS[CenarioNome]][]) {
    const fatorEscala = (numeroPessoas * cenario.fator) / receita.porcoes

    const ingredientesCalculados: ResultadoIngrediente[] = receita.ingredientes.map(ing => {
      const pesoLiquidoPorPessoa = (ing.quantidadeLiquidaKg / receita.porcoes) * cenario.fator
      const pesoBrutoPorPessoa = pesoLiquidoPorPessoa * ing.fatorCorrecao
      const pesoPoscoccaoPorPessoa = pesoLiquidoPorPessoa * ing.fatorCoccao

      const pesoLiquidoTotal = pesoLiquidoPorPessoa * numeroPessoas
      const pesoBrutoTotal = pesoBrutoPorPessoa * numeroPessoas
      const pesoPoscoccaoTotal = pesoPoscoccaoPorPessoa * numeroPessoas
      const custoTotal = pesoBrutoTotal * ing.precoUnitario

      return {
        nome: ing.nome,
        categoria: ing.categoria,
        pesoBrutoPorPessoa,
        pesoLiquidoPorPessoa,
        pesoPoscoccaoPorPessoa,
        pesoBrutoTotal,
        pesoLiquidoTotal,
        pesoPoscoccaoTotal,
        custoTotal,
      }
    })

    const custoTotalReceita = ingredientesCalculados.reduce((sum, i) => sum + i.custoTotal, 0)
    const custoPorPessoa = custoTotalReceita / numeroPessoas
    const precoVendaSugerido = custoPorPessoa * markup

    resultado[key] = {
      cenario: key,
      label: cenario.label,
      cor: cenario.cor,
      numeroPessoas,
      ingredientes: ingredientesCalculados,
      custoTotalReceita,
      custoPorPessoa,
      precoVendaSugerido,
      markup,
    }
  }

  return resultado
}

export function getAlimentoBase(nome: string) {
  return tabelaAlimentos.find(a => a.nome.toLowerCase() === nome.toLowerCase())
}

export function formatarPeso(kg: number): string {
  if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}mg`
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(3)}kg`
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
