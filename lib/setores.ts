export type Setor =
  | 'Açougue'
  | 'Peixaria'
  | 'Hortifruti'
  | 'Frios e Laticínios'
  | 'Padaria'
  | 'Mercearia'
  | 'Bebidas'

const ORDEM_SETORES: Setor[] = [
  'Açougue', 'Peixaria', 'Hortifruti', 'Frios e Laticínios', 'Padaria', 'Mercearia', 'Bebidas',
]

const PALAVRAS_PEIXARIA = [
  'tilápia', 'tilapia', 'salmão', 'salmao', 'atum', 'robalo', 'dourado',
  'peixe', 'bacalhau', 'sardinha', 'camarão', 'camarao', 'lula', 'polvo', 'mariscos',
]

export function setorMercado(nomeIngrediente: string, categoria: string): Setor {
  const n = nomeIngrediente.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (categoria === 'proteina') {
    return PALAVRAS_PEIXARIA.some(p => n.includes(p)) ? 'Peixaria' : 'Açougue'
  }
  if (categoria === 'vegetal' || categoria === 'fruta') return 'Hortifruti'
  if (categoria === 'laticinios') return 'Frios e Laticínios'
  if (categoria === 'padaria') return 'Padaria'
  if (categoria === 'bebida') return 'Bebidas'
  return 'Mercearia'
}

export interface ItemLista {
  nome: string
  categoria: string
  brutoKg: number
  liquidoKg: number
  unidade?: string | null
}

export interface GrupoSetor {
  setor: Setor
  itens: ItemLista[]
}

export function agruparPorSetor(itens: ItemLista[]): GrupoSetor[] {
  const grupos: Partial<Record<Setor, ItemLista[]>> = {}
  for (const item of itens) {
    const s = setorMercado(item.nome, item.categoria)
    if (!grupos[s]) grupos[s] = []
    grupos[s]!.push(item)
  }
  return ORDEM_SETORES
    .filter(s => grupos[s] && grupos[s]!.length > 0)
    .map(s => ({ setor: s, itens: grupos[s]!.sort((a, b) => b.brutoKg - a.brutoKg) }))
}

function fmt(kg: number): string {
  if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}mg`
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(3)}kg`
}

export function gerarTextoWhatsApp(params: {
  nomeEvento: string
  data?: string
  totalPessoas: string
  cenario: string
  grupos: GrupoSetor[]
}): string {
  const linhas: string[] = [
    `*Lista de Compras — ${params.nomeEvento}*`,
    params.data ? `📅 Data: ${params.data}` : '',
    `👥 Pessoas: ${params.totalPessoas}`,
    `📊 Cenário: ${params.cenario}`,
    '',
  ].filter(Boolean)

  for (const grupo of params.grupos) {
    linhas.push(`*${grupo.setor.toUpperCase()}*`)
    for (const item of grupo.itens) {
      const und = item.unidade ? ` (${item.unidade})` : ''
      linhas.push(`• ${item.nome}: ${fmt(item.brutoKg)}${und}`)
    }
    linhas.push('')
  }
  linhas.push('_Gerado pelo app Despensa_')
  return linhas.join('\n')
}

export function gerarHTMLImpressao(params: {
  nomeEvento: string
  data?: string
  totalPessoas: string
  cenario: string
  grupos: GrupoSetor[]
}): string {
  const linhasGrupos = params.grupos.map(grupo => {
    const linhasItens = grupo.itens.map(item => {
      const und = item.unidade ? `<span class="und">${item.unidade}</span>` : ''
      return `
        <tr>
          <td class="nome">${item.nome}</td>
          <td class="qtd">${fmt(item.brutoKg)}</td>
          <td class="und-cell">${und}</td>
        </tr>`
    }).join('')
    return `
      <div class="setor">
        <div class="setor-titulo">${grupo.setor}</div>
        <table>
          <thead>
            <tr><th>Ingrediente</th><th>Quantidade</th><th>Unidade</th></tr>
          </thead>
          <tbody>${linhasItens}</tbody>
        </table>
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Lista de Compras — ${params.nomeEvento}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; padding: 32px; font-size: 13px; }
    .header { border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
    .header-info { display: flex; gap: 24px; flex-wrap: wrap; color: #555; font-size: 12px; }
    .header-info span strong { color: #222; }
    .setor { margin-bottom: 20px; break-inside: avoid; }
    .setor-titulo { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
      color: #9B8B7A; background: #F7F5F2; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f0eeeb; }
    th { text-align: left; padding: 6px 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #717171; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
    td.nome { font-weight: 500; }
    td.qtd { font-weight: 700; width: 90px; }
    td.und-cell { color: #9B8B7A; width: 100px; font-size: 12px; }
    .footer { margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; color: #bbb; font-size: 11px; text-align: center; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Despensa</h1>
    <div class="header-info">
      <span><strong>Evento:</strong> ${params.nomeEvento}</span>
      ${params.data ? `<span><strong>Data:</strong> ${params.data}</span>` : ''}
      <span><strong>Pessoas:</strong> ${params.totalPessoas}</span>
      <span><strong>Cenário:</strong> ${params.cenario}</span>
    </div>
  </div>
  ${linhasGrupos}
  <div class="footer">Lista gerada pelo app Despensa</div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`
}
