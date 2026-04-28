export const FATOR_HOMEM = 1.00
export const FATOR_MULHER = 0.80
export const FATOR_CRIANCA = 0.50

export type TipoRefeicao = 'cafe_manha' | 'lanche' | 'almoco' | 'jantar' | 'churrasco'
export type TipoServico = 'prato' | 'bufe'

export const LABEL_TIPO: Record<TipoRefeicao, string> = {
  cafe_manha: 'Café da manhã',
  lanche: 'Lanche',
  almoco: 'Almoço',
  jantar: 'Jantar',
  churrasco: 'Churrasco',
}

// Multiplicador sobre a base (almoço = 1.0)
export const FATOR_TIPO: Record<TipoRefeicao, number> = {
  cafe_manha: 0.50,
  lanche: 0.40,
  almoco: 1.00,
  jantar: 0.85,
  churrasco: 1.35,
}

// Bufê adiciona 18% para cobrir repetições e variação
export const FATOR_SERVICO: Record<TipoServico, number> = {
  prato: 1.00,
  bufe: 1.18,
}

export interface Hospedes {
  homens: number
  mulheres: number
  criancas: number
}

export function totalEquivalente(h: Hospedes): number {
  return h.homens * FATOR_HOMEM + h.mulheres * FATOR_MULHER + h.criancas * FATOR_CRIANCA
}

export function totalPessoas(h: Hospedes): number {
  return h.homens + h.mulheres + h.criancas
}

export function somarHospedes(a: Hospedes, b: Hospedes): Hospedes {
  return {
    homens: a.homens + b.homens,
    mulheres: a.mulheres + b.mulheres,
    criancas: a.criancas + b.criancas,
  }
}
