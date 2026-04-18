interface Regra {
  label: string
  plural: string
  gramas: number
}

const DB: Record<string, Regra> = {
  // Ervas frescas
  'coentro':             { label: 'maço',        plural: 'maços',        gramas: 50 },
  'cebolinha':           { label: 'maço',         plural: 'maços',        gramas: 80 },
  'salsinha':            { label: 'maço',         plural: 'maços',        gramas: 50 },
  'salsa':               { label: 'maço',         plural: 'maços',        gramas: 50 },
  'manjericão':          { label: 'maço',         plural: 'maços',        gramas: 40 },
  'hortelã':             { label: 'maço',         plural: 'maços',        gramas: 40 },
  'tomilho':             { label: 'maço',         plural: 'maços',        gramas: 30 },
  'alecrim':             { label: 'maço',         plural: 'maços',        gramas: 30 },
  'rúcula':              { label: 'maço',         plural: 'maços',        gramas: 100 },
  'espinafre':           { label: 'maço',         plural: 'maços',        gramas: 200 },
  'agrião':              { label: 'maço',         plural: 'maços',        gramas: 100 },
  'couve':               { label: 'maço',         plural: 'maços',        gramas: 200 },
  'louro':               { label: 'maço',         plural: 'maços',        gramas: 20 },

  // Temperos e aromáticos
  'cebola':              { label: 'cebola',       plural: 'cebolas',      gramas: 150 },
  'cebola roxa':         { label: 'cebola',       plural: 'cebolas',      gramas: 150 },
  'alho':                { label: 'cabeça',       plural: 'cabeças',      gramas: 50 },
  'tomate':              { label: 'tomate',       plural: 'tomates',      gramas: 120 },
  'tomate cereja':       { label: 'bandeja',      plural: 'bandejas',     gramas: 300 },
  'pimentão vermelho':   { label: 'unidade',      plural: 'unidades',     gramas: 150 },
  'pimentão verde':      { label: 'unidade',      plural: 'unidades',     gramas: 150 },
  'pimentão amarelo':    { label: 'unidade',      plural: 'unidades',     gramas: 150 },
  'gengibre':            { label: 'pedaço',       plural: 'pedaços',      gramas: 100 },

  // Frutas
  'limão':               { label: 'limão',        plural: 'limões',       gramas: 80 },
  'limão tahiti':        { label: 'limão',        plural: 'limões',       gramas: 80 },
  'limão siciliano':     { label: 'limão',        plural: 'limões',       gramas: 130 },
  'laranja':             { label: 'laranja',      plural: 'laranjas',     gramas: 200 },
  'banana':              { label: 'banana',       plural: 'bananas',      gramas: 120 },
  'banana prata':        { label: 'banana',       plural: 'bananas',      gramas: 120 },
  'banana nanica':       { label: 'banana',       plural: 'bananas',      gramas: 150 },
  'maçã':                { label: 'maçã',         plural: 'maçãs',        gramas: 180 },
  'pera':                { label: 'pera',         plural: 'peras',        gramas: 170 },
  'manga':               { label: 'manga',        plural: 'mangas',       gramas: 300 },
  'mamão':               { label: 'mamão',        plural: 'mamões',       gramas: 800 },
  'mamão papaya':        { label: 'mamão',        plural: 'mamões',       gramas: 800 },
  'abacaxi':             { label: 'abacaxi',      plural: 'abacaxis',     gramas: 1200 },
  'melão':               { label: 'melão',        plural: 'melões',       gramas: 1200 },
  'melancia':            { label: 'melancia',     plural: 'melancias',    gramas: 5000 },
  'abacate':             { label: 'abacate',      plural: 'abacates',     gramas: 300 },
  'uva':                 { label: 'cacho',        plural: 'cachos',       gramas: 500 },
  'morango':             { label: 'bandeja',      plural: 'bandejas',     gramas: 300 },
  'caju':                { label: 'unidade',      plural: 'unidades',     gramas: 120 },

  // Legumes e verduras (por unidade)
  'cenoura':             { label: 'cenoura',      plural: 'cenouras',     gramas: 100 },
  'abobrinha':           { label: 'abobrinha',    plural: 'abobrinhas',   gramas: 350 },
  'berinjela':           { label: 'berinjela',    plural: 'berinjelas',   gramas: 400 },
  'chuchu':              { label: 'chuchu',       plural: 'chuchos',      gramas: 200 },
  'milho verde':         { label: 'espiga',       plural: 'espigas',      gramas: 250 },
  'pepino':              { label: 'pepino',       plural: 'pepinos',      gramas: 250 },
  'alface':              { label: 'pé',           plural: 'pés',          gramas: 200 },
  'brócolis':            { label: 'unidade',      plural: 'unidades',     gramas: 500 },
  'couve-flor':          { label: 'unidade',      plural: 'unidades',     gramas: 700 },
  'repolho':             { label: 'repolho',      plural: 'repolhos',     gramas: 1000 },
  'jiló':                { label: 'unidade',      plural: 'unidades',     gramas: 30 },
  'quiabo':              { label: 'bandeja',      plural: 'bandejas',     gramas: 500 },

  // Ovos
  'ovos':                { label: 'ovo',          plural: 'ovos',         gramas: 60 },
  'ovo':                 { label: 'ovo',          plural: 'ovos',         gramas: 60 },

  // Proteínas por unidade
  'frango inteiro':      { label: 'frango',       plural: 'frangos',      gramas: 1800 },
  'pão francês':         { label: 'pão',          plural: 'pães',         gramas: 50 },

  // Cogumelos e bandejas
  'cogumelo':            { label: 'bandeja',      plural: 'bandejas',     gramas: 200 },
  'cogumelo paris':      { label: 'bandeja',      plural: 'bandejas',     gramas: 200 },
  'cogumelo shimeji':    { label: 'bandeja',      plural: 'bandejas',     gramas: 200 },
  'cogumelo shiitake':   { label: 'bandeja',      plural: 'bandejas',     gramas: 100 },

  // Laticínios por embalagem
  'manteiga':            { label: 'tablete',      plural: 'tabletes',     gramas: 200 },
  'leite':               { label: 'caixa',        plural: 'caixas',       gramas: 1000 },
  'creme de leite':      { label: 'caixa',        plural: 'caixas',       gramas: 200 },
  'leite de coco':       { label: 'caixinha',     plural: 'caixinhas',    gramas: 200 },
}

// Ingredientes vendidos em kg — arredondar para 0,5 kg
const VENDE_POR_KG = new Set([
  'batata inglesa', 'batata-doce', 'batata doce', 'batata',
  'mandioca', 'aipim', 'macaxeira', 'cará', 'inhame',
  'frango peito', 'frango coxa', 'frango sobrecoxa', 'frango asa',
  'frango filé', 'frango sassami',
  'carne bovina', 'carne moída', 'carne de sol', 'costela', 'picanha',
  'alcatra', 'contrafilé', 'fraldinha', 'acém', 'patinho', 'músculo', 'maminha',
  'cupim', 'bife', 'carne',
  'peixe', 'filé de peixe', 'filé de tilápia', 'filé de salmão',
  'camarão', 'lula', 'polvo', 'bacalhau',
  'linguiça', 'calabresa', 'linguiça toscana', 'linguiça de frango',
  'arroz', 'feijão', 'feijão carioca', 'feijão preto', 'feijão fradinho',
  'lentilha', 'grão de bico', 'ervilha', 'soja',
  'farinha de mandioca', 'farinha de trigo', 'farinha de rosca', 'fubá',
  'amido de milho', 'fécula de batata',
  'açúcar', 'sal', 'sal grosso',
  'queijo mussarela', 'queijo prato', 'queijo coalho', 'queijo parmesão',
  'queijo reino', 'queijo cheddar', 'queijo brie',
  'presunto', 'peito de peru', 'salame',
  'macarrão', 'espaguete', 'penne', 'fusilli',
  'farinha', 'polvilho', 'aveia',
  'tomate pelado', 'extrato de tomate',
])

function arredondar05(kg: number): string {
  const arredondado = Math.ceil(kg * 2) / 2
  if (arredondado % 1 === 0) return `${arredondado} kg`
  return `${arredondado.toString().replace('.', ',')} kg`
}

export function converterParaCompra(nome: string, brutoKg: number): string {
  const chave = nome.toLowerCase().trim()

  // Ovos: lógica de dúzias
  if (chave === 'ovos' || chave === 'ovo') {
    const qtd = Math.ceil((brutoKg * 1000) / 60)
    if (qtd >= 24) {
      const duzias = Math.floor(qtd / 12)
      const resto = qtd % 12
      if (resto === 0) return `${duzias} dúzias`
      return `${duzias} dúzias + ${resto} ovo${resto > 1 ? 's' : ''}`
    }
    if (qtd >= 12) {
      const resto = qtd % 12
      if (resto === 0) return '1 dúzia'
      return `1 dúzia + ${resto} ovo${resto > 1 ? 's' : ''}`
    }
    return `${qtd} ovo${qtd !== 1 ? 's' : ''}`
  }

  // Ingrediente com regra de unidade conhecida
  const regra = DB[chave]
  if (regra) {
    const qtd = Math.ceil((brutoKg * 1000) / regra.gramas)
    const unidade = qtd === 1 ? regra.label : regra.plural
    return `${qtd} ${unidade}`
  }

  // Vendido por kg
  if (VENDE_POR_KG.has(chave)) {
    return arredondar05(brutoKg)
  }

  // Padrão: kg arredondado (para itens desconhecidos >= 100g) ou gramas
  if (brutoKg >= 0.1) return arredondar05(brutoKg)
  return `${Math.ceil(brutoKg * 1000)} g`
}
