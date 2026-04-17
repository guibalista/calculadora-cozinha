import type { Hospedes } from './percapita'

export interface IngredientePrato {
  id: string
  nome: string
  quantidadeBasePorPessoa: number  // kg por pessoa equivalente (fator 1.0)
  fatorCorrecao: number
  fatorCoccao: number
  categoria: string
}

export interface Prato {
  id: string
  nome: string
  ingredientes: IngredientePrato[]
}

export interface DiaDaEstadia {
  data: string           // formato YYYY-MM-DD
  label: string          // ex: "Segunda, 20/01"
  pratos: Prato[]
  extrasHospedes: Hospedes
}

export interface Estadia {
  id: string
  nome: string
  hospedes: Hospedes
  dias: DiaDaEstadia[]
}

export interface ItemListaCompras {
  nome: string
  categoria: string
  pesoBrutoTotal: number
  pesoLiquidoTotal: number
  custo?: number
}
