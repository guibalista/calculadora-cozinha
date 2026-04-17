export type CategoriaAlimento = 'proteina' | 'vegetal' | 'fruta' | 'carboidrato' | 'laticinios' | 'tempero'

export interface AlimentoBase {
  nome: string
  categoria: CategoriaAlimento
  fatorCorrecao: number      // peso bruto / peso liquido (sempre >= 1)
  fatorCoccao: number        // peso pos-coccao / peso liquido (< 1 = perde, > 1 = absorve)
  unidade: string
  percapitaGramas: number    // gramas por pessoa por refeicao (referencia)
}

export const tabelaAlimentos: AlimentoBase[] = [
  // === PROTEÍNAS ===
  { nome: 'Frango peito sem osso', categoria: 'proteina', fatorCorrecao: 1.26, fatorCoccao: 0.80, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Frango peito com osso', categoria: 'proteina', fatorCorrecao: 1.39, fatorCoccao: 0.78, unidade: 'kg', percapitaGramas: 280 },
  { nome: 'Frango coxa e sobrecoxa', categoria: 'proteina', fatorCorrecao: 1.50, fatorCoccao: 0.82, unidade: 'kg', percapitaGramas: 300 },
  { nome: 'Frango inteiro', categoria: 'proteina', fatorCorrecao: 1.38, fatorCoccao: 0.80, unidade: 'kg', percapitaGramas: 350 },
  { nome: 'Alcatra', categoria: 'proteina', fatorCorrecao: 1.21, fatorCoccao: 0.79, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Contra-filé', categoria: 'proteina', fatorCorrecao: 1.23, fatorCoccao: 0.79, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Picanha', categoria: 'proteina', fatorCorrecao: 1.27, fatorCoccao: 0.78, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Filé mignon', categoria: 'proteina', fatorCorrecao: 1.15, fatorCoccao: 0.80, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Costela bovina', categoria: 'proteina', fatorCorrecao: 1.65, fatorCoccao: 0.75, unidade: 'kg', percapitaGramas: 400 },
  { nome: 'Pernil suíno', categoria: 'proteina', fatorCorrecao: 1.42, fatorCoccao: 0.76, unidade: 'kg', percapitaGramas: 300 },
  { nome: 'Peixe inteiro', categoria: 'proteina', fatorCorrecao: 2.20, fatorCoccao: 0.82, unidade: 'kg', percapitaGramas: 300 },
  { nome: 'Tilápia filé', categoria: 'proteina', fatorCorrecao: 1.31, fatorCoccao: 0.83, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Salmão filé', categoria: 'proteina', fatorCorrecao: 1.12, fatorCoccao: 0.82, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Camarão inteiro', categoria: 'proteina', fatorCorrecao: 2.75, fatorCoccao: 0.85, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Camarão limpo', categoria: 'proteina', fatorCorrecao: 1.10, fatorCoccao: 0.85, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Bacalhau seco', categoria: 'proteina', fatorCorrecao: 1.86, fatorCoccao: 1.40, unidade: 'kg', percapitaGramas: 150 },
  { nome: 'Ovos', categoria: 'proteina', fatorCorrecao: 1.12, fatorCoccao: 0.90, unidade: 'unidade', percapitaGramas: 100 },

  // === VEGETAIS ===
  { nome: 'Cebola', categoria: 'vegetal', fatorCorrecao: 1.25, fatorCoccao: 0.70, unidade: 'kg', percapitaGramas: 30 },
  { nome: 'Alho', categoria: 'vegetal', fatorCorrecao: 1.40, fatorCoccao: 0.75, unidade: 'kg', percapitaGramas: 5 },
  { nome: 'Tomate', categoria: 'vegetal', fatorCorrecao: 1.10, fatorCoccao: 0.75, unidade: 'kg', percapitaGramas: 50 },
  { nome: 'Batata inglesa', categoria: 'vegetal', fatorCorrecao: 1.22, fatorCoccao: 0.97, unidade: 'kg', percapitaGramas: 150 },
  { nome: 'Cenoura', categoria: 'vegetal', fatorCorrecao: 1.17, fatorCoccao: 0.94, unidade: 'kg', percapitaGramas: 60 },
  { nome: 'Pimentão', categoria: 'vegetal', fatorCorrecao: 1.26, fatorCoccao: 0.80, unidade: 'kg', percapitaGramas: 30 },
  { nome: 'Abobrinha', categoria: 'vegetal', fatorCorrecao: 1.09, fatorCoccao: 0.85, unidade: 'kg', percapitaGramas: 80 },
  { nome: 'Mandioca', categoria: 'vegetal', fatorCorrecao: 1.38, fatorCoccao: 0.96, unidade: 'kg', percapitaGramas: 150 },

  // === FRUTAS ===
  { nome: 'Mamão papaia', categoria: 'fruta', fatorCorrecao: 1.50, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 150 },
  { nome: 'Melancia', categoria: 'fruta', fatorCorrecao: 1.90, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 200 },
  { nome: 'Abacaxi', categoria: 'fruta', fatorCorrecao: 1.75, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 150 },
  { nome: 'Manga', categoria: 'fruta', fatorCorrecao: 1.65, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 150 },
  { nome: 'Banana', categoria: 'fruta', fatorCorrecao: 1.40, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 100 },
  { nome: 'Limão', categoria: 'fruta', fatorCorrecao: 1.20, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 20 },

  // === CARBOIDRATOS ===
  { nome: 'Arroz branco', categoria: 'carboidrato', fatorCorrecao: 1.00, fatorCoccao: 2.50, unidade: 'kg', percapitaGramas: 80 },
  { nome: 'Feijão carioca', categoria: 'carboidrato', fatorCorrecao: 1.00, fatorCoccao: 2.20, unidade: 'kg', percapitaGramas: 60 },
  { nome: 'Macarrão', categoria: 'carboidrato', fatorCorrecao: 1.00, fatorCoccao: 2.30, unidade: 'kg', percapitaGramas: 100 },
  { nome: 'Pão francês', categoria: 'carboidrato', fatorCorrecao: 1.00, fatorCoccao: 1.00, unidade: 'unidade', percapitaGramas: 50 },

  // === LATICÍNIOS ===
  { nome: 'Leite integral', categoria: 'laticinios', fatorCorrecao: 1.00, fatorCoccao: 1.00, unidade: 'litro', percapitaGramas: 200 },
  { nome: 'Queijo muçarela', categoria: 'laticinios', fatorCorrecao: 1.00, fatorCoccao: 0.90, unidade: 'kg', percapitaGramas: 30 },
  { nome: 'Creme de leite', categoria: 'laticinios', fatorCorrecao: 1.00, fatorCoccao: 1.00, unidade: 'litro', percapitaGramas: 50 },

  // === TEMPEROS E CONDIMENTOS ===
  { nome: 'Azeite de oliva', categoria: 'tempero', fatorCorrecao: 1.00, fatorCoccao: 1.00, unidade: 'litro', percapitaGramas: 10 },
  { nome: 'Sal', categoria: 'tempero', fatorCorrecao: 1.00, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 3 },
  { nome: 'Pimenta-do-reino', categoria: 'tempero', fatorCorrecao: 1.00, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 1 },
  { nome: 'Coentro', categoria: 'tempero', fatorCorrecao: 1.15, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 5 },
  { nome: 'Salsinha', categoria: 'tempero', fatorCorrecao: 1.15, fatorCoccao: 1.00, unidade: 'kg', percapitaGramas: 5 },
  { nome: 'Manteiga', categoria: 'tempero', fatorCorrecao: 1.00, fatorCoccao: 0.85, unidade: 'kg', percapitaGramas: 10 },
]

export const MARKUP_PADRAO = 3.0

export type CenarioNome = 'conservador' | 'moderado' | 'agressivo'

export const CENARIOS: Record<CenarioNome, { fator: number; label: string; cor: string; descricao: string }> = {
  conservador: { fator: 0.85, label: 'Conservador', cor: 'blue', descricao: '85% do per capita — refeições leves ou cardápio variado' },
  moderado:    { fator: 1.00, label: 'Moderado',    cor: 'green', descricao: '100% do per capita — refeição padrão' },
  agressivo:   { fator: 1.25, label: 'Agressivo',   cor: 'orange', descricao: '125% do per capita — grande apetite ou evento especial' },
}
