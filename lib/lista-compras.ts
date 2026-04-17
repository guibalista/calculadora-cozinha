import { totalEquivalente, somarHospedes } from './percapita'
import type { Estadia, ItemListaCompras } from './types'

export function gerarListaCompras(estadia: Estadia): ItemListaCompras[] {
  const totais: Record<string, { categoria: string; liquidoTotal: number; fc: number }> = {}

  for (const dia of estadia.dias) {
    const hospedesTotais = somarHospedes(estadia.hospedes, dia.extrasHospedes)
    const equiv = totalEquivalente(hospedesTotais)

    for (const prato of dia.pratos) {
      for (const ing of prato.ingredientes) {
        const liquidoDia = ing.quantidadeBasePorPessoa * equiv
        if (!totais[ing.nome]) {
          totais[ing.nome] = { categoria: ing.categoria, liquidoTotal: 0, fc: ing.fatorCorrecao }
        }
        totais[ing.nome].liquidoTotal += liquidoDia
      }
    }
  }

  return Object.entries(totais).map(([nome, v]) => ({
    nome,
    categoria: v.categoria,
    pesoLiquidoTotal: v.liquidoTotal,
    pesoBrutoTotal: v.liquidoTotal * v.fc,
  })).sort((a, b) => a.categoria.localeCompare(b.categoria))
}

export function formatarPeso(kg: number): string {
  if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}mg`
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(2)}kg`
}
