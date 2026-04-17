export const FATOR_HOMEM = 1.00
export const FATOR_MULHER = 0.80
export const FATOR_CRIANCA = 0.50

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
