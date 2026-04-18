import type { GrupoSetor } from './setores'

function fmt(kg: number): string {
  if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}mg`
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(3)}kg`
}

// Remove ≈ e outros caracteres fora do Latin-1 (não suportados em Helvetica)
function sanitize(str: string): string {
  return str.replace(/≈\s*/g, '').replace(/[^\x00-\xFF]/g, '')
}

export async function baixarPDF(params: {
  nomeEvento: string
  data?: string
  totalPessoas: string
  cenario: string
  grupos: GrupoSetor[]
}) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const M = 18          // margem esquerda/direita
  const COL_QTD = 148   // quantidade: direita alinhada aqui
  const COL_UNIT = 152  // unidade: esquerda alinhada aqui
  let y = 24

  // ── Cabeçalho ─────────────────────────────────────────────────
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 46, 37)
  doc.text('Despensa', M, y)
  y += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 122, 104)
  const metaParts = [
    sanitize(params.nomeEvento),
    params.data ? sanitize(params.data) : null,
    sanitize(params.totalPessoas),
    `Cenario: ${sanitize(params.cenario)}`,
  ].filter(Boolean) as string[]
  const metaLine = metaParts.join('  |  ')
  const splitMeta = doc.splitTextToSize(metaLine, W - M * 2)
  doc.text(splitMeta, M, y)
  y += (splitMeta.length * 5) + 5

  doc.setDrawColor(212, 237, 224)
  doc.setLineWidth(0.6)
  doc.line(M, y, W - M, y)
  y += 8

  // ── Grupos por setor ──────────────────────────────────────────
  for (const grupo of params.grupos) {
    if (y > 250) { doc.addPage(); y = 20 }

    // Rótulo do setor
    doc.setFillColor(240, 247, 242)
    doc.roundedRect(M, y - 4.5, W - M * 2, 8, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(123, 168, 146)
    doc.text(sanitize(grupo.setor).toUpperCase(), M + 4, y + 1)
    y += 9

    // Cabeçalho de colunas
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(155, 185, 165)
    doc.text('INGREDIENTE', M + 2, y)
    doc.text('BRUTO', COL_QTD, y, { align: 'right' })
    doc.text('APROX.', COL_UNIT + 1, y)
    y += 3

    doc.setDrawColor(212, 237, 224)
    doc.setLineWidth(0.25)
    doc.line(M, y, W - M, y)
    y += 5.5

    // Itens
    for (const item of grupo.itens) {
      if (y > 272) { doc.addPage(); y = 20 }

      doc.setFontSize(10.5)

      // Nome — truncar se ultrapassar a coluna de quantidade
      const availW = COL_QTD - M - 12
      const [nomeLine] = doc.splitTextToSize(sanitize(item.nome), availW)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(26, 46, 37)
      doc.text(nomeLine, M + 2, y)

      // Quantidade (negrito, verde escuro)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(18, 140, 126)
      doc.text(fmt(item.brutoKg), COL_QTD, y, { align: 'right' })

      // Unidade (sem ≈, fonte menor, verde claro)
      if (item.unidade) {
        const unitText = sanitize(item.unidade)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(123, 168, 146)
        doc.setFontSize(9)
        doc.text(unitText, COL_UNIT + 1, y)
        doc.setFontSize(10.5)
      }

      y += 6.5

      // Separador
      doc.setDrawColor(228, 242, 234)
      doc.setLineWidth(0.2)
      doc.line(M + 2, y - 1.5, W - M - 2, y - 1.5)
    }
    y += 5
  }

  // ── Rodapé ────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(187, 187, 187)
  doc.text('Lista gerada pelo app Despensa', W / 2, 287, { align: 'center' })

  const slug = params.nomeEvento.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  doc.save(`despensa-${slug}.pdf`)
}
