export interface IngredienteCMV { nome: string; gramasPorcao: number; fc: number }
export interface PrecoIngrediente { nome: string; precoKg: number }

export function calcularCustoPorcao(
  ingredientes: IngredienteCMV[],
  precos: PrecoIngrediente[]
): number {
  return ingredientes.reduce((total, ing) => {
    const p = precos.find(p => p.nome.toLowerCase() === ing.nome.toLowerCase())
    if (!p) return total
    return total + (ing.gramasPorcao / 1000) * ing.fc * p.precoKg
  }, 0)
}

export function calcularCMV(custo: number, precoVenda: number): number {
  if (!precoVenda || precoVenda === 0) return 0
  return (custo / precoVenda) * 100
}

export function statusCMV(cmv: number): { label: string; color: string; bg: string } {
  if (cmv === 0) return { label: 'Sem preço', color: '#7BA892', bg: '#F5FAF7' }
  if (cmv <= 30) return { label: 'Excelente', color: '#128C7E', bg: '#E8F5EE' }
  if (cmv <= 35) return { label: 'Bom', color: '#5A7A68', bg: '#F0F7F2' }
  if (cmv <= 42) return { label: 'Atenção', color: '#B45309', bg: '#FFFBEB' }
  return { label: 'Crítico', color: '#DC2626', bg: '#FEF2F2' }
}

export function cmvMedio(pratos: Array<{ custo: number; precoVenda: number }>): number {
  const validos = pratos.filter(p => p.precoVenda > 0)
  if (validos.length === 0) return 0
  const totalCusto = validos.reduce((s, p) => s + p.custo, 0)
  const totalVenda = validos.reduce((s, p) => s + p.precoVenda, 0)
  return (totalCusto / totalVenda) * 100
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function precoSugerido(custo: number, cmvAlvo = 33): number {
  if (cmvAlvo <= 0) return 0
  return custo / (cmvAlvo / 100)
}
