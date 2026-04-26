import { encontrarIngrediente, classificarIngredienteDesconhecido, type Ingrediente } from './ingredientes-db'

export interface ReceitaIngrediente {
  ingrediente: string      // nome exato no DB (ou aproximado para busca)
  gramasPorPessoa?: number // override do DB se necessário
}

export interface Receita {
  id: string
  nome: string
  categoria: 'almoco' | 'jantar' | 'cafe_manha' | 'lanche' | 'churrasco' | 'acompanhamento' | 'entrada' | 'sobremesa'
  sinonimos: string[]
  ingredientes: ReceitaIngrediente[]
}

export interface ReceitaIngredienteResolvido {
  nome: string
  gramasPorPessoa: number
  fc: number
  fcc: number
  categoria: string
}

export const RECEITAS: Receita[] = [
  // ─── PRATOS PRINCIPAIS ────────────────────────────────────────

  {
    id: 'feijoada',
    nome: 'Feijoada',
    categoria: 'almoco',
    sinonimos: ['feijoada completa', 'feijoada brasileira'],
    ingredientes: [
      { ingrediente: 'Feijão preto', gramasPorPessoa: 150 },
      { ingrediente: 'Linguiça calabresa', gramasPorPessoa: 100 },
      { ingrediente: 'Paio', gramasPorPessoa: 60 },
      { ingrediente: 'Bacon', gramasPorPessoa: 40 },
      { ingrediente: 'Costela bovina', gramasPorPessoa: 150 },
      { ingrediente: 'Cebola', gramasPorPessoa: 50 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Louro', gramasPorPessoa: 1 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 10 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 6 },
      { ingrediente: 'Laranja', gramasPorPessoa: 150 },
      { ingrediente: 'Farinha de mandioca', gramasPorPessoa: 30 },
    ],
  },

  {
    id: 'frango-assado',
    nome: 'Frango assado',
    categoria: 'almoco',
    sinonimos: ['frango no forno', 'frango assado inteiro', 'frango de forno'],
    ingredientes: [
      { ingrediente: 'Frango inteiro', gramasPorPessoa: 350 },
      { ingrediente: 'Alho', gramasPorPessoa: 12 },
      { ingrediente: 'Limão', gramasPorPessoa: 25 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 5 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
      { ingrediente: 'Alecrim', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'frango-grelhado',
    nome: 'Frango grelhado',
    categoria: 'almoco',
    sinonimos: ['frango na chapa', 'peito grelhado', 'frango grelhado simples'],
    ingredientes: [
      { ingrediente: 'Frango peito s/ osso', gramasPorPessoa: 250 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Limão', gramasPorPessoa: 20 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 12 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'frango-ao-molho',
    nome: 'Frango ao molho',
    categoria: 'almoco',
    sinonimos: ['frango ensopado', 'frango cozido ao molho', 'coxa ao molho'],
    ingredientes: [
      { ingrediente: 'Frango coxa e sobrecoxa', gramasPorPessoa: 300 },
      { ingrediente: 'Cebola', gramasPorPessoa: 50 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Extrato de tomate', gramasPorPessoa: 25 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 12 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  // ─── CHURRASCO ────────────────────────────────────────────────

  {
    id: 'picanha-na-brasa',
    nome: 'Picanha na brasa',
    categoria: 'churrasco',
    sinonimos: ['picanha', 'picanha grelhada', 'picanha na grelha', 'picanha no carvão'],
    ingredientes: [
      { ingrediente: 'Picanha', gramasPorPessoa: 300 },
      { ingrediente: 'Sal', gramasPorPessoa: 5 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'costela-assada',
    nome: 'Costela assada',
    categoria: 'churrasco',
    sinonimos: ['costela no forno', 'costela bovina assada', 'costela de churrasco'],
    ingredientes: [
      { ingrediente: 'Costela bovina', gramasPorPessoa: 450 },
      { ingrediente: 'Sal', gramasPorPessoa: 6 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
      { ingrediente: 'Vinagre', gramasPorPessoa: 10 },
    ],
  },

  {
    id: 'fraldinha-grelhada',
    nome: 'Fraldinha grelhada',
    categoria: 'churrasco',
    sinonimos: ['fraldinha', 'fraldinha na brasa', 'fraldinha na grelha'],
    ingredientes: [
      { ingrediente: 'Fraldinha', gramasPorPessoa: 250 },
      { ingrediente: 'Sal', gramasPorPessoa: 5 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'alcatra-assada',
    nome: 'Alcatra assada',
    categoria: 'churrasco',
    sinonimos: ['alcatra', 'alcatra na brasa', 'alcatra grelhada'],
    ingredientes: [
      { ingrediente: 'Alcatra', gramasPorPessoa: 250 },
      { ingrediente: 'Sal', gramasPorPessoa: 5 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
    ],
  },

  {
    id: 'costelinha-suina',
    nome: 'Costelinha suína',
    categoria: 'churrasco',
    sinonimos: ['costelinha', 'costelinha de porco', 'costela suína', 'ribs'],
    ingredientes: [
      { ingrediente: 'Costelinha suína', gramasPorPessoa: 400 },
      { ingrediente: 'Sal', gramasPorPessoa: 5 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
      { ingrediente: 'Vinagre', gramasPorPessoa: 10 },
    ],
  },

  {
    id: 'pernil-assado',
    nome: 'Pernil assado',
    categoria: 'almoco',
    sinonimos: ['pernil de porco', 'pernil suíno assado', 'pernil no forno'],
    ingredientes: [
      { ingrediente: 'Pernil suíno', gramasPorPessoa: 350 },
      { ingrediente: 'Alho', gramasPorPessoa: 12 },
      { ingrediente: 'Sal', gramasPorPessoa: 6 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
      { ingrediente: 'Vinagre', gramasPorPessoa: 15 },
      { ingrediente: 'Laranja', gramasPorPessoa: 100 },
    ],
  },

  {
    id: 'linguica-assada',
    nome: 'Linguiça assada',
    categoria: 'churrasco',
    sinonimos: ['linguiça', 'linguiça na brasa', 'linguiça calabresa assada'],
    ingredientes: [
      { ingrediente: 'Linguiça calabresa', gramasPorPessoa: 120 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Pimentão vermelho', gramasPorPessoa: 30 },
    ],
  },

  // ─── PEIXES E FRUTOS DO MAR ───────────────────────────────────

  {
    id: 'moqueca-de-peixe',
    nome: 'Moqueca de peixe',
    categoria: 'almoco',
    sinonimos: ['moqueca', 'moqueca baiana', 'moqueca de tilápia', 'moqueca de peixe branco'],
    ingredientes: [
      { ingrediente: 'Tilápia filé', gramasPorPessoa: 220 },
      { ingrediente: 'Cebola', gramasPorPessoa: 60 },
      { ingrediente: 'Tomate', gramasPorPessoa: 60 },
      { ingrediente: 'Pimentão vermelho', gramasPorPessoa: 40 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 8 },
      { ingrediente: 'Leite de coco', gramasPorPessoa: 80 },
      { ingrediente: 'Dendê', gramasPorPessoa: 15 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'moqueca-de-camarao',
    nome: 'Moqueca de camarão',
    categoria: 'almoco',
    sinonimos: ['moqueca de camarão', 'camarão na moqueca', 'moqueca baiana de camarão'],
    ingredientes: [
      { ingrediente: 'Camarão limpo', gramasPorPessoa: 220 },
      { ingrediente: 'Cebola', gramasPorPessoa: 60 },
      { ingrediente: 'Tomate', gramasPorPessoa: 60 },
      { ingrediente: 'Pimentão vermelho', gramasPorPessoa: 40 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 8 },
      { ingrediente: 'Leite de coco', gramasPorPessoa: 80 },
      { ingrediente: 'Dendê', gramasPorPessoa: 15 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'bacalhau-ao-forno',
    nome: 'Bacalhau ao forno',
    categoria: 'almoco',
    sinonimos: ['bacalhau assado', 'bacalhau no forno', 'bacalhau gratinado'],
    ingredientes: [
      { ingrediente: 'Bacalhau dessalgado', gramasPorPessoa: 200 },
      { ingrediente: 'Batata inglesa', gramasPorPessoa: 180 },
      { ingrediente: 'Cebola', gramasPorPessoa: 60 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 20 },
      { ingrediente: 'Pimentão vermelho', gramasPorPessoa: 30 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'salmao-grelhado',
    nome: 'Salmão grelhado',
    categoria: 'almoco',
    sinonimos: ['salmão', 'filé de salmão', 'salmão na chapa'],
    ingredientes: [
      { ingrediente: 'Salmão filé', gramasPorPessoa: 200 },
      { ingrediente: 'Limão', gramasPorPessoa: 20 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 12 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
      { ingrediente: 'Alecrim', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'peixe-assado',
    nome: 'Peixe assado',
    categoria: 'almoco',
    sinonimos: ['tilápia assada', 'peixe no forno', 'filé de peixe assado'],
    ingredientes: [
      { ingrediente: 'Tilápia filé', gramasPorPessoa: 200 },
      { ingrediente: 'Limão', gramasPorPessoa: 20 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 12 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 6 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'camarao-alho-oleo',
    nome: 'Camarão alho e óleo',
    categoria: 'almoco',
    sinonimos: ['camarão ao alho', 'camarão refogado', 'camarão na manteiga'],
    ingredientes: [
      { ingrediente: 'Camarão limpo', gramasPorPessoa: 200 },
      { ingrediente: 'Alho', gramasPorPessoa: 12 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 15 },
      { ingrediente: 'Salsinha', gramasPorPessoa: 5 },
      { ingrediente: 'Limão', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'polvo-alho-oleo',
    nome: 'Polvo ao alho e óleo',
    categoria: 'almoco',
    sinonimos: ['polvo', 'polvo grelhado', 'polvo ao azeite'],
    ingredientes: [
      { ingrediente: 'Polvo', gramasPorPessoa: 250 },
      { ingrediente: 'Alho', gramasPorPessoa: 12 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 15 },
      { ingrediente: 'Salsinha', gramasPorPessoa: 5 },
      { ingrediente: 'Limão', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  // ─── MASSAS ───────────────────────────────────────────────────

  {
    id: 'macarrao-bolonhesa',
    nome: 'Macarrão à bolonhesa',
    categoria: 'almoco',
    sinonimos: ['espaguete bolonhesa', 'macarrão com carne', 'espaguete com carne moída'],
    ingredientes: [
      { ingrediente: 'Macarrão espaguete', gramasPorPessoa: 100 },
      { ingrediente: 'Carne moída bovina', gramasPorPessoa: 150 },
      { ingrediente: 'Extrato de tomate', gramasPorPessoa: 30 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'macarrao-alho-oleo',
    nome: 'Macarrão ao alho e óleo',
    categoria: 'almoco',
    sinonimos: ['espaguete alho e óleo', 'macarrão simples', 'espaguete ao azeite'],
    ingredientes: [
      { ingrediente: 'Macarrão espaguete', gramasPorPessoa: 100 },
      { ingrediente: 'Alho', gramasPorPessoa: 15 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 20 },
      { ingrediente: 'Salsinha', gramasPorPessoa: 5 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'risoto-de-queijo',
    nome: 'Risoto de queijo',
    categoria: 'almoco',
    sinonimos: ['risoto', 'risoto de parmesão', 'risoto cremoso'],
    ingredientes: [
      { ingrediente: 'Risoto (arroz arbóreo)', gramasPorPessoa: 90 },
      { ingrediente: 'Queijo parmesão', gramasPorPessoa: 20 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 50 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  // ─── CARNES DIVERSAS ──────────────────────────────────────────

  {
    id: 'carne-moida-refogada',
    nome: 'Carne moída refogada',
    categoria: 'almoco',
    sinonimos: ['carne moída', 'picadinho de carne', 'carne moída ao molho'],
    ingredientes: [
      { ingrediente: 'Carne moída bovina', gramasPorPessoa: 200 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Tomate', gramasPorPessoa: 40 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'frango-milanesa',
    nome: 'Frango à milanesa',
    categoria: 'almoco',
    sinonimos: ['milanesa de frango', 'frango empanado', 'frango à milanesa'],
    ingredientes: [
      { ingrediente: 'Frango peito s/ osso', gramasPorPessoa: 250 },
      { ingrediente: 'Farinha de trigo', gramasPorPessoa: 30 },
      { ingrediente: 'Ovos', gramasPorPessoa: 30 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 20 },
    ],
  },

  {
    id: 'file-mignon-ao-molho',
    nome: 'Filé mignon ao molho',
    categoria: 'jantar',
    sinonimos: ['filé ao molho', 'filé mignon', 'medalhão ao molho', 'filé com cogumelos'],
    ingredientes: [
      { ingrediente: 'Filé mignon', gramasPorPessoa: 220 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 50 },
      { ingrediente: 'Cogumelos', gramasPorPessoa: 50 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
      { ingrediente: 'Pimenta-do-reino', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'frango-com-quiabo',
    nome: 'Frango com quiabo',
    categoria: 'almoco',
    sinonimos: ['frango ao quiabo', 'galinha com quiabo', 'frango mineiro'],
    ingredientes: [
      { ingrediente: 'Frango coxa e sobrecoxa', gramasPorPessoa: 300 },
      { ingrediente: 'Quiabo', gramasPorPessoa: 80 },
      { ingrediente: 'Cebola', gramasPorPessoa: 50 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 12 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  // ─── ACOMPANHAMENTOS ──────────────────────────────────────────

  {
    id: 'arroz-branco',
    nome: 'Arroz branco',
    categoria: 'acompanhamento',
    sinonimos: ['arroz', 'arroz cozido', 'arroz simples'],
    ingredientes: [
      { ingrediente: 'Arroz branco', gramasPorPessoa: 80 },
      { ingrediente: 'Cebola', gramasPorPessoa: 20 },
      { ingrediente: 'Alho', gramasPorPessoa: 4 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'feijao-carioca',
    nome: 'Feijão carioca',
    categoria: 'acompanhamento',
    sinonimos: ['feijão', 'feijão cozido', 'feijão temperado'],
    ingredientes: [
      { ingrediente: 'Feijão carioca', gramasPorPessoa: 80 },
      { ingrediente: 'Bacon', gramasPorPessoa: 25 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
      { ingrediente: 'Louro', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'feijao-preto',
    nome: 'Feijão preto',
    categoria: 'acompanhamento',
    sinonimos: ['feijão preto cozido', 'feijão preto temperado'],
    ingredientes: [
      { ingrediente: 'Feijão preto', gramasPorPessoa: 80 },
      { ingrediente: 'Cebola', gramasPorPessoa: 25 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
      { ingrediente: 'Louro', gramasPorPessoa: 1 },
    ],
  },

  {
    id: 'arroz-e-feijao',
    nome: 'Arroz e feijão',
    categoria: 'acompanhamento',
    sinonimos: ['prato do dia', 'arroz com feijão', 'base brasileira'],
    ingredientes: [
      { ingrediente: 'Arroz branco', gramasPorPessoa: 80 },
      { ingrediente: 'Feijão carioca', gramasPorPessoa: 70 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'farofa-simples',
    nome: 'Farofa simples',
    categoria: 'acompanhamento',
    sinonimos: ['farofa', 'farofa de manteiga', 'farofa básica'],
    ingredientes: [
      { ingrediente: 'Farinha de mandioca', gramasPorPessoa: 40 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'farofa-com-bacon',
    nome: 'Farofa com bacon',
    categoria: 'acompanhamento',
    sinonimos: ['farofa de bacon', 'farofa especial', 'farofa de churrasco'],
    ingredientes: [
      { ingrediente: 'Farinha de mandioca', gramasPorPessoa: 40 },
      { ingrediente: 'Bacon', gramasPorPessoa: 30 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'vinagrete',
    nome: 'Vinagrete',
    categoria: 'acompanhamento',
    sinonimos: ['molho vinagrete', 'salsa', 'molho de churrasco'],
    ingredientes: [
      { ingrediente: 'Tomate', gramasPorPessoa: 80 },
      { ingrediente: 'Cebola', gramasPorPessoa: 50 },
      { ingrediente: 'Pimentão verde', gramasPorPessoa: 30 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 5 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 10 },
      { ingrediente: 'Vinagre', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'salada-verde',
    nome: 'Salada verde',
    categoria: 'acompanhamento',
    sinonimos: ['salada', 'salada simples', 'salada mista'],
    ingredientes: [
      { ingrediente: 'Alface', gramasPorPessoa: 50 },
      { ingrediente: 'Tomate', gramasPorPessoa: 60 },
      { ingrediente: 'Cebola', gramasPorPessoa: 25 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'pure-de-batata',
    nome: 'Purê de batata',
    categoria: 'acompanhamento',
    sinonimos: ['purê', 'pure', 'puré de batata', 'batata amassada'],
    ingredientes: [
      { ingrediente: 'Batata inglesa', gramasPorPessoa: 200 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 20 },
      { ingrediente: 'Leite integral', gramasPorPessoa: 50 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'mandioca-cozida',
    nome: 'Mandioca cozida',
    categoria: 'acompanhamento',
    sinonimos: ['macaxeira cozida', 'aipim cozido', 'mandioca', 'macaxeira'],
    ingredientes: [
      { ingrediente: 'Mandioca', gramasPorPessoa: 200 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'couve-refogada',
    nome: 'Couve refogada',
    categoria: 'acompanhamento',
    sinonimos: ['couve', 'couve mineira', 'couve ao alho'],
    ingredientes: [
      { ingrediente: 'Couve manteiga', gramasPorPessoa: 50 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'brocolis-refogado',
    nome: 'Brócolis refogado',
    categoria: 'acompanhamento',
    sinonimos: ['brócolis', 'brócolis ao alho', 'brócolos refogado'],
    ingredientes: [
      { ingrediente: 'Brócolis', gramasPorPessoa: 80 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'batata-assada',
    nome: 'Batata assada',
    categoria: 'acompanhamento',
    sinonimos: ['batata no forno', 'batata assada simples', 'batata de churrasco'],
    ingredientes: [
      { ingrediente: 'Batata inglesa', gramasPorPessoa: 200 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  // ─── CAFÉ DA MANHÃ / LANCHE ───────────────────────────────────

  {
    id: 'ovos-mexidos',
    nome: 'Ovos mexidos',
    categoria: 'cafe_manha',
    sinonimos: ['ovo mexido', 'ovos remexidos', 'scrambled eggs'],
    ingredientes: [
      { ingrediente: 'Ovos', gramasPorPessoa: 100 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'tapioca-de-queijo',
    nome: 'Tapioca de queijo',
    categoria: 'cafe_manha',
    sinonimos: ['tapioca', 'tapioca recheada', 'tapioca com queijo'],
    ingredientes: [
      { ingrediente: 'Tapioca', gramasPorPessoa: 60 },
      { ingrediente: 'Queijo mussarela', gramasPorPessoa: 30 },
    ],
  },

  {
    id: 'pao-com-manteiga',
    nome: 'Pão com manteiga',
    categoria: 'cafe_manha',
    sinonimos: ['pão na manteiga', 'torrada com manteiga', 'café da manhã simples'],
    ingredientes: [
      { ingrediente: 'Pão de forma', gramasPorPessoa: 60 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
    ],
  },

  {
    id: 'salada-de-frutas',
    nome: 'Salada de frutas',
    categoria: 'sobremesa',
    sinonimos: ['salada fruta', 'mix de frutas', 'frutas picadas'],
    ingredientes: [
      { ingrediente: 'Mamão', gramasPorPessoa: 150 },
      { ingrediente: 'Manga', gramasPorPessoa: 100 },
      { ingrediente: 'Banana', gramasPorPessoa: 80 },
      { ingrediente: 'Abacaxi', gramasPorPessoa: 100 },
      { ingrediente: 'Limão', gramasPorPessoa: 10 },
      { ingrediente: 'Açúcar', gramasPorPessoa: 10 },
    ],
  },

  // ─── ENTRADAS / CALDOS ────────────────────────────────────────

  {
    id: 'caldo-de-feijao',
    nome: 'Caldo de feijão',
    categoria: 'entrada',
    sinonimos: ['caldo de feijão preto', 'sopa de feijão', 'caldo feijão'],
    ingredientes: [
      { ingrediente: 'Feijão preto', gramasPorPessoa: 100 },
      { ingrediente: 'Linguiça calabresa', gramasPorPessoa: 60 },
      { ingrediente: 'Bacon', gramasPorPessoa: 30 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'queijo-coalho-grelhado',
    nome: 'Queijo coalho grelhado',
    categoria: 'entrada',
    sinonimos: ['queijo coalho', 'queijo de coalho', 'coalho na grelha'],
    ingredientes: [
      { ingrediente: 'Queijo coalho', gramasPorPessoa: 80 },
    ],
  },

  // ─── LEGUMINOSAS / OUTROS ─────────────────────────────────────

  {
    id: 'lentilha-cozida',
    nome: 'Lentilha cozida',
    categoria: 'almoco',
    sinonimos: ['lentilha', 'sopa de lentilha', 'lentilha temperada'],
    ingredientes: [
      { ingrediente: 'Lentilha', gramasPorPessoa: 80 },
      { ingrediente: 'Cebola', gramasPorPessoa: 30 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Cenoura', gramasPorPessoa: 40 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  // ─── CAFÉ DA MANHÃ COMPLETO ───────────────────────────────────

  {
    id: 'cafe-da-manha-completo',
    nome: 'Café da manhã completo',
    categoria: 'cafe_manha',
    sinonimos: ['café completo', 'café da manhã', 'desjejum', 'pequeno almoço'],
    ingredientes: [
      { ingrediente: 'Pão de forma', gramasPorPessoa: 60 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Ovos', gramasPorPessoa: 60 },
      { ingrediente: 'Queijo mussarela', gramasPorPessoa: 30 },
      { ingrediente: 'Presunto', gramasPorPessoa: 30 },
      { ingrediente: 'Mamão', gramasPorPessoa: 100 },
      { ingrediente: 'Banana', gramasPorPessoa: 80 },
    ],
  },

  {
    id: 'cuscuz-nordestino',
    nome: 'Cuscuz nordestino',
    categoria: 'cafe_manha',
    sinonimos: ['cuscuz', 'cuscuz com ovo', 'cuscuz temperado'],
    ingredientes: [
      { ingrediente: 'Cuscuz', gramasPorPessoa: 80 },
      { ingrediente: 'Ovos', gramasPorPessoa: 60 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'beiju-tapioca',
    nome: 'Beiju de tapioca',
    categoria: 'cafe_manha',
    sinonimos: ['beiju', 'tapioca simples', 'tapioca de manteiga'],
    ingredientes: [
      { ingrediente: 'Tapioca', gramasPorPessoa: 70 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 10 },
      { ingrediente: 'Queijo coalho', gramasPorPessoa: 40 },
    ],
  },

  {
    id: 'vitamina-frutas',
    nome: 'Vitamina de frutas',
    categoria: 'cafe_manha',
    sinonimos: ['vitamina', 'suco de frutas', 'smoothie', 'batido de fruta'],
    ingredientes: [
      { ingrediente: 'Banana', gramasPorPessoa: 100 },
      { ingrediente: 'Mamão', gramasPorPessoa: 100 },
      { ingrediente: 'Leite integral', gramasPorPessoa: 150 },
      { ingrediente: 'Açúcar', gramasPorPessoa: 10 },
    ],
  },

  {
    id: 'omelete',
    nome: 'Omelete',
    categoria: 'cafe_manha',
    sinonimos: ['omelette', 'omelete de queijo', 'omelete recheado'],
    ingredientes: [
      { ingrediente: 'Ovos', gramasPorPessoa: 120 },
      { ingrediente: 'Queijo mussarela', gramasPorPessoa: 30 },
      { ingrediente: 'Tomate', gramasPorPessoa: 30 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 10 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  // ─── PRATOS TÍPICOS NORDESTE / PRAIA ──────────────────────────

  {
    id: 'bobo-de-camarao',
    nome: 'Bobó de camarão',
    categoria: 'almoco',
    sinonimos: ['bobó', 'bobó baiano', 'bobó de camarão baiano'],
    ingredientes: [
      { ingrediente: 'Camarão limpo', gramasPorPessoa: 200 },
      { ingrediente: 'Mandioca', gramasPorPessoa: 150 },
      { ingrediente: 'Leite de coco', gramasPorPessoa: 80 },
      { ingrediente: 'Dendê', gramasPorPessoa: 10 },
      { ingrediente: 'Cebola', gramasPorPessoa: 50 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'escondidinho-camarao',
    nome: 'Escondidinho de camarão',
    categoria: 'almoco',
    sinonimos: ['escondidinho', 'escondidinho de frutos do mar'],
    ingredientes: [
      { ingrediente: 'Camarão limpo', gramasPorPessoa: 150 },
      { ingrediente: 'Mandioca', gramasPorPessoa: 200 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 40 },
      { ingrediente: 'Queijo mussarela', gramasPorPessoa: 40 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Alho', gramasPorPessoa: 8 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'ceviche',
    nome: 'Ceviche',
    categoria: 'entrada',
    sinonimos: ['ceviche de peixe', 'ceviche de camarão', 'ceviche brasileiro'],
    ingredientes: [
      { ingrediente: 'Tilápia filé', gramasPorPessoa: 150 },
      { ingrediente: 'Limão siciliano', gramasPorPessoa: 50 },
      { ingrediente: 'Cebola roxa', gramasPorPessoa: 40 },
      { ingrediente: 'Coentro fresco', gramasPorPessoa: 8 },
      { ingrediente: 'Pimentão vermelho', gramasPorPessoa: 20 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'lagosta-grelhada',
    nome: 'Lagosta grelhada',
    categoria: 'jantar',
    sinonimos: ['lagosta', 'lagosta ao alho', 'lagosta na manteiga'],
    ingredientes: [
      { ingrediente: 'Lagosta', gramasPorPessoa: 350 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 25 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Limão', gramasPorPessoa: 20 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'strogonoff-frango',
    nome: 'Strogonoff de frango',
    categoria: 'almoco',
    sinonimos: ['estrogonofe', 'strogonoff', 'frango ao creme'],
    ingredientes: [
      { ingrediente: 'Frango peito s/ osso', gramasPorPessoa: 250 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 60 },
      { ingrediente: 'Extrato de tomate', gramasPorPessoa: 20 },
      { ingrediente: 'Cogumelos', gramasPorPessoa: 40 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  {
    id: 'strogonoff-carne',
    nome: 'Strogonoff de carne',
    categoria: 'almoco',
    sinonimos: ['strogonoff de filé', 'estrogonofe de carne', 'filé ao creme'],
    ingredientes: [
      { ingrediente: 'Filé mignon', gramasPorPessoa: 220 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 60 },
      { ingrediente: 'Extrato de tomate', gramasPorPessoa: 20 },
      { ingrediente: 'Cogumelos', gramasPorPessoa: 40 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 15 },
      { ingrediente: 'Sal', gramasPorPessoa: 4 },
    ],
  },

  // ─── SOBREMESAS ───────────────────────────────────────────────

  {
    id: 'pudim-leite',
    nome: 'Pudim de leite',
    categoria: 'sobremesa',
    sinonimos: ['pudim', 'pudim de leite condensado', 'pudim caseiro'],
    ingredientes: [
      { ingrediente: 'Leite condensado', gramasPorPessoa: 80 },
      { ingrediente: 'Leite integral', gramasPorPessoa: 80 },
      { ingrediente: 'Ovos', gramasPorPessoa: 40 },
      { ingrediente: 'Açúcar', gramasPorPessoa: 30 },
    ],
  },

  {
    id: 'mousse-maracuja',
    nome: 'Mousse de maracujá',
    categoria: 'sobremesa',
    sinonimos: ['mousse', 'mousse de maracujá', 'sobremesa de maracujá'],
    ingredientes: [
      { ingrediente: 'Leite condensado', gramasPorPessoa: 80 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 50 },
      { ingrediente: 'Maracujá', gramasPorPessoa: 60 },
    ],
  },

  {
    id: 'pave-chocolate',
    nome: 'Pavê de chocolate',
    categoria: 'sobremesa',
    sinonimos: ['pavê', 'pave', 'pavê gelado'],
    ingredientes: [
      { ingrediente: 'Biscoito champagne', gramasPorPessoa: 50 },
      { ingrediente: 'Leite condensado', gramasPorPessoa: 80 },
      { ingrediente: 'Creme de leite', gramasPorPessoa: 50 },
      { ingrediente: 'Achocolatado', gramasPorPessoa: 20 },
    ],
  },

  // ─── SOPAS ────────────────────────────────────────────────────

  {
    id: 'sopa-legumes',
    nome: 'Sopa de legumes',
    categoria: 'jantar',
    sinonimos: ['sopa de verduras', 'caldo de legumes', 'sopa simples'],
    ingredientes: [
      { ingrediente: 'Batata inglesa', gramasPorPessoa: 100 },
      { ingrediente: 'Cenoura', gramasPorPessoa: 60 },
      { ingrediente: 'Abobrinha', gramasPorPessoa: 60 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  {
    id: 'caldo-verde',
    nome: 'Caldo verde',
    categoria: 'jantar',
    sinonimos: ['caldo de couve', 'sopa caldo verde', 'caldo verde português'],
    ingredientes: [
      { ingrediente: 'Batata inglesa', gramasPorPessoa: 150 },
      { ingrediente: 'Couve manteiga', gramasPorPessoa: 40 },
      { ingrediente: 'Linguiça calabresa', gramasPorPessoa: 60 },
      { ingrediente: 'Cebola', gramasPorPessoa: 40 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },

  // ─── LANCHES / ENTRADAS ───────────────────────────────────────

  {
    id: 'tabua-frios',
    nome: 'Tábua de frios',
    categoria: 'entrada',
    sinonimos: ['frios', 'tábua', 'queijos e frios', 'aperitivo'],
    ingredientes: [
      { ingrediente: 'Queijo mussarela', gramasPorPessoa: 50 },
      { ingrediente: 'Presunto', gramasPorPessoa: 40 },
      { ingrediente: 'Salame', gramasPorPessoa: 30 },
      { ingrediente: 'Queijo coalho', gramasPorPessoa: 40 },
      { ingrediente: 'Pão francês', gramasPorPessoa: 50 },
    ],
  },

  {
    id: 'bruschetta',
    nome: 'Bruschetta',
    categoria: 'entrada',
    sinonimos: ['torrada com tomate', 'bruscheta', 'pão com tomate'],
    ingredientes: [
      { ingrediente: 'Pão italiano', gramasPorPessoa: 60 },
      { ingrediente: 'Tomate', gramasPorPessoa: 80 },
      { ingrediente: 'Alho', gramasPorPessoa: 6 },
      { ingrediente: 'Azeite de oliva', gramasPorPessoa: 15 },
      { ingrediente: 'Manjericão', gramasPorPessoa: 5 },
      { ingrediente: 'Sal', gramasPorPessoa: 2 },
    ],
  },

  {
    id: 'pao-de-alho',
    nome: 'Pão de alho',
    categoria: 'entrada',
    sinonimos: ['pão alho', 'bread de alho', 'garlic bread'],
    ingredientes: [
      { ingrediente: 'Pão francês', gramasPorPessoa: 80 },
      { ingrediente: 'Manteiga', gramasPorPessoa: 25 },
      { ingrediente: 'Alho', gramasPorPessoa: 10 },
      { ingrediente: 'Salsinha', gramasPorPessoa: 5 },
    ],
  },

  {
    id: 'mandioca-frita',
    nome: 'Mandioca frita',
    categoria: 'entrada',
    sinonimos: ['macaxeira frita', 'aipim frito', 'mandioca crocante'],
    ingredientes: [
      { ingrediente: 'Mandioca', gramasPorPessoa: 200 },
      { ingrediente: 'Óleo de soja', gramasPorPessoa: 30 },
      { ingrediente: 'Sal', gramasPorPessoa: 3 },
    ],
  },
]

// ─── FUNÇÕES ──────────────────────────────────────────────────────────────────

// Busca fuzzy de receitas
export function buscarReceita(termo: string): Receita[] {
  if (!termo || termo.length < 2) return []
  const t = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return RECEITAS.filter(r => {
    const nome = r.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const sins = r.sinonimos.map(s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    return nome.includes(t) || sins.some(s => s.includes(t))
  }).slice(0, 5)
}

// Resolve receita: busca cada ingrediente no DB e retorna com FC/FCC
export function resolverReceita(receita: Receita): ReceitaIngredienteResolvido[] {
  return receita.ingredientes.map(ri => {
    const ing = encontrarIngrediente(ri.ingrediente) ?? classificarIngredienteDesconhecido(ri.ingrediente)
    return {
      nome: ing.nome,
      gramasPorPessoa: ri.gramasPorPessoa ?? ing.percapitaGramas,
      fc: ing.fatorCorrecao,
      fcc: ing.fatorCoccao,
      categoria: ing.categoria,
    }
  })
}
